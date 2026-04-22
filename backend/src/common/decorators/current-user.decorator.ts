import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    return req.user;
  },
);
