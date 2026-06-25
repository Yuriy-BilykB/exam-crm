import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Reads a cookie from the request.
 *   @Cookies('refresh_token') token: string | undefined
 * Without a key returns the whole cookies object.
 */
export const Cookies = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const cookies = (request.cookies ?? {}) as Record<
      string,
      string | undefined
    >;
    return key ? cookies[key] : cookies;
  },
);
