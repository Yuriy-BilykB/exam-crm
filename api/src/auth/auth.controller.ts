import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { refreshCookieKey } from 'src/shared/cookie-options';
import { Cookies } from '../common/decorators/cookies.decorator';
import { AppConfigService } from '../config/app-config.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...rest } = await this.authService.login(dto);
    res.cookie(
      refreshCookieKey,
      refreshToken,
      this.config.refreshCookieOptions,
    );
    return rest;
  }

  @Post('refresh')
  async refresh(
    @Cookies(refreshCookieKey) refreshCookie: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...rest } =
      await this.authService.refreshTokens(refreshCookie);
    res.cookie(
      refreshCookieKey,
      refreshToken,
      this.config.refreshCookieOptions,
    );
    return rest;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(refreshCookieKey, {
      ...this.config.refreshCookieOptions,
      maxAge: undefined,
    });
    return { message: 'Logged out' };
  }

  @Post('set-password')
  setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: { id: string; role: string } }) {
    return this.authService.getProfile(req.user.id);
  }
}
