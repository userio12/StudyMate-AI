import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { DatabaseService } from '../database/database.service.js';
import { UserCacheService } from '../common/cache/user-cache.service.js';
import { users } from '@studymate/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class ClerkAuthService {
  private clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
    private userCache: UserCacheService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY')!,
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = await this.clerk.verifyToken(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getOrCreateUser(clerkId: string) {
    const now = new Date();
    
    // 1. Check cache first
    const cachedUserId = this.userCache.get(clerkId);
    let user: any = null;

    if (cachedUserId) {
      user = await this.db.db!.query.users.findFirst({
        where: eq(users.id, cachedUserId),
      });
      // If we found the user via cache, we still need to check if it's a new day
      // but we skipped the clerkId lookup.
    }

    if (!user) {
      // 2. Fetch/Create/Update by clerkId
      user = await this.db.db!.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });
    }

    if (!user) {
      const clerkUser = await this.clerk.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
      const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null;
      // Start with 1 as this is their first "session" detected by our backend
      const sessionCount = 1;

      const id = crypto.randomUUID();
      
      [user] = await this.db.db!
        .insert(users)
        .values({
          id,
          clerkId,
          email,
          name,
          avatarUrl: clerkUser.imageUrl,
          sessionCount,
          lastActiveAt: now,
        })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: {
            email,
            name,
            avatarUrl: clerkUser.imageUrl,
            lastActiveAt: now,
          },
        })
        .returning();

      // Sync initial sessionCount to Clerk if it wasn't there
      await this.clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: { sessionCount },
      });
    } else {
      // Logic to increment session count if it's a new day
      const lastActive = user.lastActiveAt;
      const isNewDay = !lastActive || now.toDateString() !== lastActive.toDateString();

      if (isNewDay) {
        const newCount = user.sessionCount + 1;
        await this.db.db!
          .update(users)
          .set({ 
            sessionCount: newCount, 
            lastActiveAt: now,
            updatedAt: now 
          })
          .where(eq(users.id, user.id));
        
        // Sync to Clerk so frontend useTrustLevel hook gets updated value
        await this.clerk.users.updateUserMetadata(clerkId, {
          publicMetadata: { sessionCount: newCount },
        });
        
        user.sessionCount = newCount;
        user.lastActiveAt = now;
      }
    }

    if (user) {
      this.userCache.set(clerkId, user.id);
      return user;
    }
    
    throw new UnauthorizedException('User synchronization failed');
  }
}
