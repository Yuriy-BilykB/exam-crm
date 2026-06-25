import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type TokenType = 'activate' | 'recovery';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/** What we store inside each kind of token */
export type AccessTokenPayload = { userId: string; role: string };
export type RefreshTokenPayload = { userId: string };
export type ActionTokenPayload = { tokenType: TokenType; userId: string };

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const ACTION_TOKEN_TTL = '30m';

/**
 * Owns all JWT creation/verification: login pair (access + refresh) and the
 * short-lived activate/recovery action tokens.
 */
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /** Sign a short-lived access token and a long-lived refresh token */
  generateAuthTokens(user: { id: string; role: string }): AuthTokens {
    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = { userId: user.id };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_TTL,
    });
    return { accessToken, refreshToken };
  }

  /** Verify a refresh token (from cookie) and return its payload */
  verifyRefreshToken(refreshToken: string | undefined): RefreshTokenPayload {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    try {
      return this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  /** Generate short-lived token for activate or recovery (30 min) */
  generateActionToken(userId: string, tokenType: TokenType): string {
    const payload: ActionTokenPayload = { tokenType, userId };
    return this.jwtService.sign(payload, { expiresIn: ACTION_TOKEN_TTL });
  }

  /** Verify action token and return payload */
  verifyActionToken(token: string): ActionTokenPayload {
    try {
      const { tokenType, userId } =
        this.jwtService.verify<ActionTokenPayload>(token);
      if (!tokenType || !userId) {
        throw new BadRequestException('Invalid token');
      }
      if (tokenType !== 'activate' && tokenType !== 'recovery') {
        throw new BadRequestException('Invalid token type');
      }
      return { tokenType, userId };
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }
}
