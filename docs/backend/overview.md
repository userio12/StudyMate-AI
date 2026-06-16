# Backend Overview

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Runtime** | Node.js 22+ | LTS, stable, excellent TypeScript support |
| **Framework** | NestJS 11 | Modular architecture, dependency injection, guards/interceptors/pipes |
| **Language** | TypeScript 5.7 | Strict mode, `@typescript-eslint` rules |
| **ORM** | Drizzle ORM | Type-safe SQL, pgvector support, no hidden queries |
| **Database** | Supabase Postgres | Managed Postgres with pgvector extension |
| **Auth** | Clerk SDK | JWT verification, session management, webhook sync |
| **AI** | Google Gemini | Embeddings (`text-embedding-004`) + Chat (`gemini-2.0-flash`) |
| **Storage** | AWS S3 | Presigned URLs for direct upload, CDN-compatible |
| **Validation** | Zod | Runtime validation, shared schemas with frontend |
| **Documentation** | Swagger/OpenAPI | Auto-generated from NestJS decorators |

## Project Structure

```
apps/backend/
├── src/
│   ├── main.ts                        # Bootstrap application
│   ├── app.module.ts                  # Root module
│   ├── modules/
│   │   ├── auth/                      # Authentication module
│   │   ├── documents/                 # Document CRUD + processing
│   │   ├── chat/                      # RAG chat with SSE streaming
│   │   ├── quiz/                      # Quiz generation + attempts
│   │   ├── rooms/                     # Study rooms + WebSocket
│   │   ├── ai/                        # Gemini integration services
│   │   ├── storage/                   # AWS S3 service
│   │   └── analytics/                 # Study statistics
│   ├── common/
│   │   ├── filters/                   # Exception filters
│   │   ├── interceptors/              # Logging, transform, timeout
│   │   ├── pipes/                     # Zod validation pipe
│   │   ├── guards/                    # Rate limiting, auth
│   │   ├── decorators/                # @CurrentUser, @Public
│   │   └── middleware/                # Helmet, compression, CORS
│   ├── config/                        # Typed environment configuration
│   ├── telemetry/                     # OpenTelemetry tracing
│   └── health/                        # Readiness + liveness probes
├── test/
│   ├── unit/                          # Unit tests (Vitest)
│   ├── integration/                   # Integration tests (Testcontainers)
│   └── e2e/                           # E2E tests (Supertest)
├── drizzle/                           # Migration files
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── Dockerfile
└── package.json
```

## Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── DatabaseModule (global)
├── AiModule (global — provides AI services to all modules)
│
├── AuthModule
│   └── ClerkAuthGuard (used by all controllers)
│
├── DocumentsModule
│   ├── depends on: StorageModule, AiModule
│   └── exports: DocumentsService
│
├── ChatModule
│   ├── depends on: AiModule, DatabaseModule
│   └── imports: DocumentsModule (for doc validation)
│
├── QuizModule
│   ├── depends on: AiModule, DatabaseModule
│   └── imports: DocumentsModule
│
├── RoomsModule
│   ├── depends on: DatabaseModule
│   └── WebSocketGateway (Socket.IO)
│
├── StorageModule
│   └── depends on: ConfigModule (S3 credentials)
│
├── AnalyticsModule
│   └── depends on: DatabaseModule
│
└── HealthModule (no dependencies)
```

## Key Design Decisions

### Why NestJS over Express/Fastify?

NestJS provides a fixed architecture that scales well:
- **Module system** enforces separation of concerns
- **Dependency injection** makes testing straightforward
- **Guards, interceptors, pipes** provide cross-cutting concerns without middleware spaghetti
- **WebSockets** integration for real-time rooms uses the same DI container
- **Swagger** auto-generation from decorators

### Why Drizzle over Prisma/TypeORM?

- **pgvector support**: Drizzle has first-class vector column support
- **Performance**: Raw SQL execution without ORM overhead
- **Type safety**: Full TypeScript inference without code generation
- **Migration control**: SQL-first migrations with a diff tool
- **Bundle size**: Tree-shakeable, no heavy runtime

### Why SSE over WebSockets for Chat?

| Factor | SSE | WebSocket |
|---|---|---|
| **Direction** | Server → Client only (chat is one-way stream) | Bidirectional |
| **Simplicity** | Single HTTP request, no upgrade | Upgrade handshake, keepalive |
| **Restart safety** | Automatically reconnects | Requires manual reconnection |
| **Firewall** | Works through all proxies | May be blocked |
| **Streaming** | Native `ReadableStream` API | Events/messages |

WebSockets are reserved for **study rooms** where bidirectional real-time communication is required.

### Why Gemini over OpenAI?

- **Cost**: Gemini is significantly cheaper for both embeddings and chat
- **Context window**: 1M+ tokens for Gemini 2.0 Flash vs 128K for GPT-4o
- **Embedding dimension**: 768 (vs 1536 for OpenAI) — smaller vectors, faster queries
- **Streaming**: First-token latency is competitive with OpenAI

## Environment Variables

```env
# Required
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres
CLERK_SECRET_KEY=sk_test_xxxx
GEMINI_API_KEY=AIzaSyxxxx
AWS_ACCESS_KEY_ID=AKIAxxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET=studymate-ai-uploads
FRONTEND_URL=http://localhost:3000

# Optional
SENTRY_DSN=https://xxxx@o000.ingest.sentry.io/000000
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
```

## Local Development

```bash
# 1. Start dependencies (Postgres with pgvector)
docker compose up -d postgres

# 2. Install dependencies
pnpm install

# 3. Generate + run migrations
pnpm --filter @studymate/db db:generate
pnpm --filter @studymate/db db:migrate

# 4. Seed development data
pnpm --filter @studymate/db db:seed

# 5. Start backend in watch mode
pnpm --filter backend dev

# 6. Open Swagger docs
open http://localhost:4000/api/docs
```

## Available Scripts

```json
{
  "dev": "nest start --watch",
  "build": "nest build",
  "start": "node dist/main",
  "lint": "eslint src --ext .ts",
  "test": "vitest",
  "test:e2e": "vitest --config vitest.e2e.config.ts",
  "test:coverage": "vitest --coverage"
}
```
