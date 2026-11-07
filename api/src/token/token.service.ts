import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../database/prisma.service';

export type TokenType = 'activate' | 'recovery';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AccessTokenPayload = {
  tokenUse: 'access';
  userId: string;
  role: string;
  sessionId: string;
};
export type RefreshTokenPayload = {
  tokenUse: 'refresh';
  userId: string;
  sessionId: string;
};
export type ActionTokenPayload = {
  tokenUse: 'action';
  tokenType: TokenType;
  userId: string;
};

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const ACTION_TOKEN_TTL = '30m';
const ACTION_TOKEN_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  generateAuthTokens(
    user: { id: string; role: string },
    sessionId: string,
  ): AuthTokens {
    const accessPayload: AccessTokenPayload = {
      tokenUse: 'access',
      sessionId,
      userId: user.id,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      tokenUse: 'refresh',
      sessionId,
      userId: user.id,
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.jwtRefreshSecret,
      expiresIn: REFRESH_TOKEN_TTL,
      jwtid: randomUUID(),
    });
    return { accessToken, refreshToken };
  }

  async createSession(
    user: { id: string; role: string },
    passwordHash: string,
  ): Promise<AuthTokens> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
      const current = await tx.user.findUnique({
        where: { id: user.id },
        omit: { password: false },
      });
      if (
        !current ||
        current.password !== passwordHash ||
        current.isBanned ||
        (!current.isActive && current.role !== 'admin')
      ) {
        throw new UnauthorizedException('User no longer allowed');
      }
      const sessionId = randomUUID();
      const tokens = this.generateAuthTokens(current, sessionId);
      await tx.session.create({
        data: {
          id: sessionId,
          userId: current.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return tokens;
    });
  }

  async rotateSession(refreshToken: string | undefined) {
    const { userId, sessionId } = this.verifyRefreshToken(refreshToken);
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.isBanned || (!user.isActive && user.role !== 'admin')) {
        throw new UnauthorizedException('User no longer allowed');
      }
      const tokens = this.generateAuthTokens(user, sessionId);
      const { count } = await tx.session.updateMany({
        where: {
          id: sessionId,
          userId,
          refreshToken: refreshToken!,
          expiresAt: { gt: new Date() },
        },
        data: {
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      if (count !== 1)
        throw new UnauthorizedException(
          'Session expired or refresh token already used',
        );
      return { ...tokens, user };
    });
  }

  async revokeSession(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    let payload: RefreshTokenPayload;
    try {
      payload = this.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }
    await this.prisma.session.deleteMany({
      where: { id: payload.sessionId, userId: payload.userId },
    });
  }

  verifyRefreshToken(refreshToken: string | undefined): RefreshTokenPayload {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.config.jwtRefreshSecret,
        },
      );
      if (
        payload.tokenUse !== 'refresh' ||
        typeof payload.userId !== 'string' ||
        !payload.userId ||
        typeof payload.sessionId !== 'string' ||
        !payload.sessionId
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  async generateActionToken(
    userId: string,
    tokenType: TokenType,
  ): Promise<string> {
    const payload: ActionTokenPayload = {
      tokenUse: 'action',
      tokenType,
      userId,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: ACTION_TOKEN_TTL,
      jwtid: randomUUID(),
    });
    await this.prisma.$transaction(async (tx) => {
      // Prisma has no dedicated SELECT ... FOR UPDATE API, so raw SQL locks this
      // user's row until the transaction commits or rolls back. Concurrent token
      // generation for the same user waits, keeping delete-and-create sequential.
      // We chose this approach over a composite unique index on (userId, type)
      // with upsert/conflict handling. A unique index prevents duplicate rows;
      // this lock serializes cooperating operations, including password changes.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      await tx.activationToken.deleteMany({
        where: { userId, type: tokenType },
      });
      await tx.activationToken.create({
        data: {
          token: token,
          type: tokenType,
          expiresAt: new Date(Date.now() + ACTION_TOKEN_TTL_MS),
          userId,
        },
      });
    });
    return token;
  }

  verifyActionToken(token: string): ActionTokenPayload {
    try {
      const { tokenUse, tokenType, userId } =
        this.jwtService.verify<ActionTokenPayload>(token);
      if (tokenUse !== 'action' || !userId) {
        throw new BadRequestException('Invalid token');
      }
      if (tokenType !== 'activate' && tokenType !== 'recovery') {
        throw new BadRequestException('Invalid token type');
      }
      return { tokenUse, tokenType, userId };
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }
}
