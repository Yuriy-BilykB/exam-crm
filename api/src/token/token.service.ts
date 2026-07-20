import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service';

export type TokenType = 'activate' | 'recovery';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AccessTokenPayload = { userId: string; role: string };
export type RefreshTokenPayload = { userId: string };
export type ActionTokenPayload = { tokenType: TokenType; userId: string };

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const ACTION_TOKEN_TTL = '30m';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

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
      return this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  generateActionToken(userId: string, tokenType: TokenType): string {
    const payload: ActionTokenPayload = { tokenType, userId };
    return this.jwtService.sign(payload, { expiresIn: ACTION_TOKEN_TTL });
  }

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
