import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import type { CurrentUserPayload } from '../decorators/current-user.decorator.js';
import { ClerkAuthService } from '../clerk-auth.service.js';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private clerkAuth: ClerkAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    const payload = await this.clerkAuth.verifyToken(token);
    const clerkId = payload.sub;

    if (!clerkId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.clerkAuth.getOrCreateUser(clerkId);

    const userPayload: CurrentUserPayload = {
      userId: user.id,
      clerkId,
      email: user.email,
      name: user.name,
    };

    request.user = userPayload;
    return true;
  }
}
