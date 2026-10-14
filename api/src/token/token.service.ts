import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
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
};
export type RefreshTokenPayload = { tokenUse: 'refresh'; userId: string };
export type ActionTokenPayload = {
  tokenUse: 'action';
  tokenType: TokenType;
  userId: string;
};

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const ACTION_TOKEN_TTL = '30m';
const ACTION_TOKEN_TTL_MS = 30 * 60 * 1000;

export function hashActionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  generateAuthTokens(user: { id: string; role: string }): AuthTokens {
    const accessPayload: AccessTokenPayload = {
      tokenUse: 'access',
      userId: user.id,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      tokenUse: 'refresh',
      userId: user.id,
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.jwtRefreshSecret,
      expiresIn: REFRESH_TOKEN_TTL,
    });
    return { accessToken, refreshToken };
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
      if (payload.tokenUse !== 'refresh' || !payload.userId) {
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
    await this.prisma.activationToken.create({
      data: {
        token: hashActionToken(token),
        type: tokenType,
        expiresAt: new Date(Date.now() + ACTION_TOKEN_TTL_MS),
        userId,
      },
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
