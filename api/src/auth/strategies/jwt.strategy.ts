import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload } from '../../token/token.service';
import { AppConfigService } from '../../config/app-config.service';
import { UserRole } from '../../common/enums';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  async validate(payload: Partial<AccessTokenPayload>) {
    if (
      payload?.tokenUse !== 'access' ||
      typeof payload.userId !== 'string' ||
      !payload.userId ||
      (payload.role !== UserRole.ADMIN && payload.role !== UserRole.MANAGER)
    ) {
      throw new UnauthorizedException('Invalid access token');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true, isBanned: true },
    });
    if (
      !user ||
      user.isBanned ||
      (!user.isActive && user.role !== UserRole.ADMIN)
    ) {
      throw new UnauthorizedException('User no longer allowed');
    }
    return { id: user.id, role: user.role };
  }
}
