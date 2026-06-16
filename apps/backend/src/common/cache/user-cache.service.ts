import { Injectable } from '@nestjs/common';

interface CacheEntry {
  userId: string;
  expiresAt: number;
}

@Injectable()
export class UserCacheService {
  private store = new Map<string, CacheEntry>();
  private readonly ttl = 300_000;

  get(clerkId: string): string | undefined {
    const entry = this.store.get(clerkId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(clerkId);
      return undefined;
    }
    return entry.userId;
  }

  set(clerkId: string, userId: string) {
    this.store.set(clerkId, { userId, expiresAt: Date.now() + this.ttl });
  }

  clear() {
    this.store.clear();
  }
}
