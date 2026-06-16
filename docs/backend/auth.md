# Authentication (Clerk)

## Architecture

```
Frontend (Next.js)                    Backend (NestJS)
     │                                     │
     │  1. User signs in via Clerk UI      │
     │  (handled by @clerk/nextjs)         │
     │                                     │
     │  2. Frontend gets session token     │
     │  const token = await getToken()     │
     │                                     │
     │  3. API call with Bearer token      │
     │  Authorization: Bearer <token>      │
     ├────────────────────────────────────►│
     │                                     │
     │                                     │  4. ClerkAuthGuard
     │                                     │     └─ verifyToken(token, secretKey)
     │                                     │
     │                                     │  5. Find/create user in local DB
     │                                     │     └─ upsert by clerkId
     │                                     │
     │                                     │  6. Attach user to request
     │                                     │     └─ @CurrentUser() decorator
     │                                     │
     │  Response with data                 │
     │◄────────────────────────────────────┤
```

## Guard Implementation

```typescript
// auth/guards/clerk-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // Verify the Clerk JWT
      const payload = await verifyToken(token, {
        secretKey: this.config.clerkSecretKey,
      });

      // Sync user to our local database
      const user = await this.syncUser({
        clerkId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture,
      });

      // Attach user to request for downstream use
      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  private async syncUser(clerkUser: {
    clerkId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) {
    // Try to find existing user
    const existing = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkUser.clerkId),
    });

    if (existing) {
      // Update profile on every request (keeps data fresh)
      const [updated] = await this.db.update(users)
        .set({
          email: clerkUser.email,
          name: clerkUser.name,
          avatarUrl: clerkUser.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }

    // Create new user
    const [created] = await this.db.insert(users)
      .values({
        clerkId: clerkUser.clerkId,
        email: clerkUser.email,
        name: clerkUser.name,
        avatarUrl: clerkUser.avatarUrl || null,
      })
      .returning();

    return created;
  }
}
```

## Current User Decorator

```typescript
// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Usage in controller:
@Get()
async findAll(@CurrentUser() user: User) {
  return this.documentsService.findAll(user.id);
}

// Or with field extraction:
@Post()
async create(@CurrentUser('id') userId: string) { ... }
```

## Public Route Decorator

For routes that don't require authentication (health check, webhooks):

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Updated guard:
async canActivate(context: ExecutionContext): Promise<boolean> {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (isPublic) return true;

  // ... existing auth logic
}

// Usage:
@Public()
@Get('health')
async health() { ... }
```

## Clerk Webhook Handler

For real-time user events (account deletion, email change):

```typescript
// api/webhooks/clerk
@Public()
@Post('webhooks/clerk')
async handleWebhook(
  @Headers('svix-id') svixId: string,
  @Headers('svix-timestamp') svixTimestamp: string,
  @Headers('svix-signature') svixSignature: string,
  @Body() body: any,
) {
  // Verify webhook signature
  const payload = verifyWebhook(body, svixId, svixTimestamp, svixSignature);

  switch (payload.type) {
    case 'user.deleted':
      await this.handleUserDeleted(payload.data);
      break;
    case 'user.updated':
      await this.handleUserUpdated(payload.data);
      break;
  }

  return { received: true };
}
```

## Frontend Integration

```typescript
// frontend/lib/api-client.ts
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useApiClient() {
  const { getToken } = useAuth();

  async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error);
    }

    return response.json();
  }

  return {
    get: <T>(path: string) => apiRequest<T>(path),
    post: <T>(path: string, body?: any) =>
      apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    delete: <T>(path: string) =>
      apiRequest<T>(path, { method: 'DELETE' }),
    streamPost: (path: string, body: any) => {
      // For SSE streaming, return raw fetch response
      return fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    },
  };
}
```

## Security Notes

1. **Token expiration**: Clerk session tokens expire after 1 hour. Frontend auto-refreshes via Clerk SDK.
2. **No password storage**: Clerk handles all credential management. Our DB never sees passwords.
3. **Webhook verification**: Clerk webhooks include `svix-*` headers. Always verify before processing.
4. **Rate limiting**: Even auth-protected routes have rate limits to prevent brute force through our API.
5. **CORS**: Backend only accepts requests from `FRONTEND_URL` environment variable.
