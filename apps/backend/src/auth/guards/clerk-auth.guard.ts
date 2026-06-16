import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import type { CurrentUserPayload } from '../decorators/current-user.decorator.js';
import { DatabaseService } from '../../database/database.service.js';
import { eq } from 'drizzle-orm';
import { users } from '@studymate/db';

interface UserCacheEntry {
  userId: string;
  email: string;
  name: string | null;
  expiresAt: number;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerk: ReturnType<typeof createClerkClient>;
  private userCache = new Map<string, UserCacheEntry>();
  private readonly cacheTTL = 300_000;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private db: DatabaseService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY')!,
    });
  }

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

    try {
      const payload = await this.clerk.verifyToken(token);
      const clerkId = payload.sub;

      if (!clerkId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const cached = this.userCache.get(clerkId);
      if (cached && Date.now() < cached.expiresAt) {
        request.user = { userId: cached.userId, clerkId, email: cached.email, name: cached.name } satisfies CurrentUserPayload;
        return true;
      }

      const existingUser = await this.db.db!.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });

      let userId: string;
      let userEmail: string;
      let userName: string | null;

      if (existingUser) {
        userId = existingUser.id;
        userEmail = existingUser.email;
        userName = existingUser.name;
      } else {
        const id = crypto.randomUUID();

        const clerkUser = await this.clerk.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
        const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null;

        await this.db.db!.insert(users).values({
          id,
          clerkId,
          email,
          name,
          avatarUrl: clerkUser.imageUrl,
        });

        userId = id;
        userEmail = email;
        userName = name;
      }

      this.userCache.set(clerkId, { userId, email: userEmail, name: userName, expiresAt: Date.now() + this.cacheTTL });

      const userPayload: CurrentUserPayload = {
        userId,
        clerkId,
        email: userEmail,
        name: userName,
      };

      request.user = userPayload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
