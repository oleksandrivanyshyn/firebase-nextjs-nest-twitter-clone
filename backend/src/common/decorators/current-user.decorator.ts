import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user: DecodedIdToken }>();
    return req.user;
  },
);
