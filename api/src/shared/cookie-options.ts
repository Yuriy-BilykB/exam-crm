import { CookieOptions } from 'express';

export const refreshCookieKey = 'refresh_token';

export const buildRefreshCookieOptions = (secure: boolean): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
