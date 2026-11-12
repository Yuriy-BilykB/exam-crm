import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import { z } from 'zod';
import { buildRefreshCookieOptions } from '../shared/cookie-options';

const boolFromString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

export const localEnv = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5050),

  DATABASE_URL: z.string().min(1),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  COOKIE_SECURE: boolFromString,
});

export type LocalEnv = z.infer<typeof localEnv>;

@Injectable()
export class AppConfigService {
  static validate = (config: Record<string, unknown>): LocalEnv =>
    localEnv.parse(config);

  constructor(private readonly configService: ConfigService<LocalEnv, true>) {}

  get nodeEnv(): LocalEnv['NODE_ENV'] {
    return this.configService.get('NODE_ENV');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get port(): number {
    return this.configService.get('PORT');
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL');
  }

  get frontendUrl(): string {
    return this.configService.get('FRONTEND_URL');
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get('JWT_REFRESH_SECRET');
  }

  get cookieSecure(): boolean {
    return this.configService.get('COOKIE_SECURE');
  }

  get refreshCookieOptions(): CookieOptions {
    return buildRefreshCookieOptions(this.cookieSecure);
  }
}
