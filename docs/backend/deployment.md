# Backend Deployment

## Platform: Render

### Web Service Configuration

| Setting | Value |
|---|---|
| **Name** | studymate-api |
| **Runtime** | Docker |
| **Dockerfile Path** | `./docker/Dockerfile.backend` |
| **Port** | 4000 |
| **Instance Type** | Starter ($7/month, 512MB RAM) |
| **Auto-Deploy** | Yes (from `main` branch) |
| **Health Check Path** | `/api/health` |

### Dockerfile

```dockerfile
# docker/Dockerfile.backend
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

# Install dependencies (frozen lockfile ensures reproducibility)
RUN pnpm install --frozen-lockfile --filter backend --filter @studymate/shared --filter @studymate/db

# Copy source code
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/

# Build
RUN pnpm --filter backend build

# Production image
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/main"]
```

### Environment Variables (Set in Render Dashboard)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
GEMINI_API_KEY=AIzaSy...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=studymate-ai-uploads
FRONTEND_URL=https://studymate-ai.vercel.app
SENTRY_DSN=https://...
LOG_LEVEL=info
```

### GitHub Actions Auto-Deploy

```yaml
# .github/workflows/cd.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'
      - 'packages/shared/**'
      - 'packages/db/**'
      - 'docker/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## Alternative: Railway

```toml
# railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/Dockerfile.backend"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Alternative: Fly.io

```toml
# fly.toml
app = "studymate-api"

[build]
  dockerfile = "docker/Dockerfile.backend"

[http_service]
  internal_port = 4000
  force_https = true
  auto_stop_machines = false

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

## Database Migrations

Migrations run as part of the deployment process:

```yaml
# Option 1: Run in a pre-deploy step (Render)
render.yaml:
  preDeployCommand: pnpm --filter @studymate/db db:migrate

# Option 2: Run in a GitHub Action before triggering deploy
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @studymate/db db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Monitoring

### Structured Logging (Pino)

```typescript
// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          this.logger.log(`${method} ${url} ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(`${method} ${url} ${duration}ms - ${error.message}`);
        },
      }),
    );
  }
}
```

### Error Tracking (Sentry)

```typescript
// main.ts
import * as Sentry from '@sentry/node';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });

  // ... rest of bootstrap
}
```

### Health Checks

```typescript
// health/health.controller.ts
@Controller('api')
export class HealthController {
  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private ai: AiService,
    private config: ConfigService,
  ) {}

  @Public()
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('ready')
  async readiness() {
    const checks = {
      database: await this.checkDatabase(),
      storage: await this.checkStorage(),
      ai: await this.checkAi(),
    };

    const allHealthy = Object.values(checks).every(c => c === 'connected');
    return {
      status: allHealthy ? 'ok' : 'degraded',
      checks,
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }

  private async checkStorage(): Promise<string> {
    try {
      await this.storage.healthCheck();
      return 'reachable';
    } catch {
      return 'unreachable';
    }
  }

  private async checkAi(): Promise<string> {
    try {
      await this.ai.healthCheck();
      return 'reachable';
    } catch {
      return 'unreachable';
    }
  }
}
```

## Performance Tuning

### Connection Pooling

Supabase uses PgBouncer for connection pooling. Connection string format:

```env
# Transaction mode (recommended for API servers)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true

# Session mode (for migrations)
DIRECT_DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### Query Optimization

```sql
-- Vector search index (already in schema)
CREATE INDEX idx_chunks_embedding ON chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Composite index for document filtering + vector search
CREATE INDEX idx_chunks_doc_embedding ON chunks (document_id, embedding vector_cosine_ops);
```

### Caching (Optional Redis)

For frequently accessed data (document lists, conversation lists):

```typescript
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async getOrSet<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const fresh = await fn();
    await this.redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  }
}

// Usage:
async findAll(userId: string): Promise<Document[]> {
  return this.cache.getOrSet(
    `documents:${userId}`,
    60, // 1 minute TTL
    () => this.db.query.documents.findMany({ where: eq(documents.userId, userId) }),
  );
}
```

## Rollback Strategy

1. **Database**: Keep the last N migrations. To rollback:
   ```bash
   pnpm --filter @studymate/db db:rollback
   ```

2. **Deployment**: Render keeps the previous version. Click "Rollback" in the dashboard.

3. **Emergency**: Stop the service, revert the PR, re-deploy the last known-good commit:
   ```bash
   git revert HEAD --no-edit
   git push origin main
   # Auto-deploy triggers
   ```
