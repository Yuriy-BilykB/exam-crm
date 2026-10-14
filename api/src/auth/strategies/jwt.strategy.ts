import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload } from '../../token/token.service';
import { AppConfigService } from '../../config/app-config.service';
import { UserRole } from '../../common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  validate(payload: Partial<AccessTokenPayload>) {
    if (
      payload?.tokenUse !== 'access' ||
      typeof payload.userId !== 'string' ||
      !payload.userId ||
      (payload.role !== UserRole.ADMIN && payload.role !== UserRole.MANAGER)
    ) {
      throw new UnauthorizedException('Invalid access token');
    }
    return { id: payload.userId, role: payload.role };
  }
}
