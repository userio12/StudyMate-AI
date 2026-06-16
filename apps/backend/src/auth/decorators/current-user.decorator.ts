import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  userId: string;
  clerkId: string;
  email: string;
  name: string | null;
}

export const CurrentUser = createParamDecorator<CurrentUserPayload>(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserPayload;
  },
);
