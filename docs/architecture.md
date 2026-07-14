# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Internet                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌──────────────────┐     ┌──────────────────────┐
          │   Next.js 15     │     │     NestJS API       │
          │   (Frontend)     │────▶│     (Backend)        │
          │                  │     │                      │
          │  Vercel Deploy   │     │  Render Deploy       │
          └──────────────────┘     └──────────────────────┘
                                         │         │
                          ┌──────────────┤         ├──────────────┐
                          │              │         │              │
                          ▼              ▼         ▼              ▼
                   ┌──────────┐   ┌────────┐ ┌────────┐   ┌──────────┐
                   │ Supabase │   │Supabase│ │ OpenAI │   │  Clerk   │
                   │ Postgres │   │ Storage│ │  API   │   │   Auth   │
                   │+pgvector │   └────────┘ └────────┘   └──────────┘
                   └──────────┘
```

## Layer Architecture

### 1. Monorepo (Root)

```
studymate-ai/
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # Next.js 15 application
├── packages/
│   ├── shared/           # Types, Zod schemas, constants
│   ├── db/               # Drizzle schema, migrations, seeds
│   ├── config-eslint/    # Shared ESLint configuration
│   ├── config-typescript/# Shared TypeScript configuration
│   └── config-tailwind/  # Shared Tailwind CSS configuration
├── docker/               # Docker Compose + Dockerfiles
└── docs/                 # VitePress documentation site
```

**Orchestration:** Turborepo manages dependency graph, build caching, and parallel task execution across all packages.

```
pnpm dev    → turbo runs dev in all apps/packages concurrently
pnpm build → turbo builds in topological order (dependencies first)
pnpm test  → turbo runs tests in parallel with dependency awareness
```

### 2. Backend Architecture (NestJS)

```
HTTP Request
    │
    ▼
┌────────────────────────────────────────────────────────────┐
│  Middleware (Helmet, Compression, CORS)                     │
├────────────────────────────────────────────────────────────┤
│  ClerkAuthGuard (JWT verification via @clerk/clerk-sdk-node)│
├────────────────────────────────────────────────────────────┤
│  Global Pipes (Zod validation from @studymate/shared)      │
├────────────────────────────────────────────────────────────┤
│  Global Interceptors (Logging, Response Transform, Timeout)│
├────────────────────────────────────────────────────────────┤
│  Controller Layer                                           │
│  ┌──────────┐ ┌──────┐ ┌────┐ ┌───────┐ ┌──────────┐    │
│  │Documents │ │ Chat │ │Quiz│ │ Rooms │ │Analytics │    │
│  └────┬─────┘ └──┬───┘ └──┬─┘ └───┬───┘ └──────────┘    │
│       │          │        │       │                        │
├───────┴──────────┴────────┴───────┴────────────────────────┤
│  Service Layer                                              │
│  ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────┐ ┌──────────┐  │
│  │Documents │ │ Chat │ │  Quiz    │ │Room│ │Analytics │  │
│  │ Service  │ │Service│ │ Service  │ │Svc │ │ Service  │  │
│  └────┬─────┘ └──┬───┘ └──┬───────┘ └──┬─┘ └──────────┘  │
│       │          │        │            │                    │
├───────┴──────────┴────────┴────────────┴────────────────────┤
│  AI Service Layer                                           │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────────┐       │
│  │PDF Processor │ │Embeddings│ │ Chat LLM + Quiz  │       │
│  └──────┬───────┘ └────┬─────┘ └────────┬─────────┘       │
│         │              │                │                    │
├─────────┴──────────────┴────────────────┴───────────────────┤
│  Data Layer                                                 │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────────────┐  │
│  │ Storage  │ │   Database   │ │   External APIs        │  │
│  │(Supabase)│ │ (Drizzle+SQ) │ │ (OpenAI, Clerk)        │  │
│  └──────────┘ └──────────────┘ └────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 3. Frontend Architecture (Next.js 15)

```
Browser Request
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Clerk Middleware (route protection)                 │
├─────────────────────────────────────────────────────┤
│  Root Layout (ClerkProvider, ThemeProvider)           │
├─────────────────────────────────────────────────────┤
│  Route Groups                                        │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐ │
│  │Marketing │ │   Auth   │ │     Dashboard        │ │
│  │ (public) │ │ (public) │ │     (protected)      │ │
│  └──────────┘ └──────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Dashboard Shell                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Sidebar (nav)        │  Navbar (user)      │   │
│  ├───────────────────────┴─────────────────────┤   │
│  │  Main Content Area                           │   │
│  │  ┌─────────┐┌────────┐┌──────┐┌─────────┐  │   │
│  │  │Dashboard││Documents││ Chat ││  Quiz   │  │   │
│  │  └─────────┘└────────┘└──────┘└─────────┘  │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Data Fetching Layer                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │  SWR (cache + revalidate)  │  SSE Stream    │   │
│  ├─────────────────────────────┴───────────────┤   │
│  │  API Client (fetch + Clerk Bearer token)    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Data Flow: Core User Journey

### 1. Upload PDF → Ready for Chat

```
User              Frontend              Backend            Supabase        AI Provider
 │                   │                     │                   │               │
 │ Drop PDF          │                     │                   │               │
 ├──────────────────▶│                     │                   │               │
 │                   │ POST /upload-url    │                   │               │
 │                   ├────────────────────▶│                   │               │
 │                   │                     │ Generate Presigned│               │
 │                   │                     │ URL ─────────────▶│               │
 │                   │ { presignedUrl }    │                   │               │
 │                   │◄────────────────────┤                   │               │
 │                   │                     │                   │               │
 │                   │ PUT (file) ────────────────────────────▶│               │
 │                   │                     │                   │               │
 │                   │ POST /:id/process   │                   │               │
 │                   ├────────────────────▶│                   │               │
 │                   │                     │ status=processing │               │
 │                   │                     │──────────────────────────────────▶               │
 │                   │                     │ Download PDF ◄────│               │
 │                   │                     │ Extract text      │               │
 │                   │                     │ Semantic chunking │               │
 │                   │                     │ (heading-aware)   │               │
 │                   │                     │ For each chunk:   │               │
 │                   │                     │  embed ─────────────────────────────────────────▶│
 │                   │                     │  ◄─ embedding ──────────────────────────────────│
 │                   │                     │  INSERT chunk ──────────────────▶               │
 │                   │                     │ status=ready ──────────────────▶               │
 │                   │◄─ { status: ready } │                   │               │
 │◄──────────────────┤                     │                   │               │
 │ Ready to chat     │                     │                   │               │
```

### 2. Chat with RAG

```
User              Frontend              Backend            Supabase       AI Provider
 │                   │                     │                   │               │
 │ Type question     │                     │                   │               │
 ├──────────────────▶│                     │                   │               │
 │                   │ POST /chat/message  │                   │               │
 │                   │ ├─ conversationId   │                   │               │
 │                   │ ├─ content          │                   │               │
 │                   │ └─ documentIds      │                   │               │
 │                   ├────────────────────▶│                   │               │
 │                   │                     │ Save user msg ────▶               │
 │                   │                     │ Embed query ─────────────────────▶│
 │                   │                     │◄─ embedding ─────────────────────│
 │                   │                     │                   │               │
 │                   │                     │ Vector search     │               │
 │                   │                     │ SELECT content,   │               │
 │                   │                     │   page_number     │               │
 │                   │                     │ FROM chunks       │               │
 │                   │                     │ WHERE embedding   │               │
 │                   │                     │   <=> $1 LIMIT 5  │               │
 │                   │                     │───────────────────▶               │
 │                   │                     │◄── top 5 chunks ──│               │
 │                   │                     │                   │               │
 │                   │                     │ Build prompt w/   │               │
 │                   │                     │ context + citations               │
 │                   │                     │ LLM stream ──────────────────────▶│
 │                   │  SSE: token         │◄─── tokens ──────────────────────│
 │                   │◄─── ['data',...] ────│                   │               │
 │  Streaming text   │                     │                   │               │
 │◄──────────────────┤                     │                   │               │
 │                   │                     │                   │               │
 │                   │  SSE: citation      │                   │               │
 │                   │◄─── {type,citation} ─│                   │               │
 │  Show citation    │                     │                   │               │
 │                   │  SSE: done          │                   │               │
 │                   │◄─── {type: 'done'} ─│                   │               │
 │                   │                     │ Save assistant    │               │
 │ Complete response │                     │ msg + citations ──▶               │
 │◄──────────────────┤                     │                   │               │
```

### 3. Quiz Generation & Attempt

```
User              Frontend              Backend            Supabase       AI Provider
 │                   │                     │                   │               │
 │ Generate quiz     │                     │                   │               │
 ├──────────────────▶│                     │                   │               │
 │                   │ POST /quiz/generate │                   │               │
 │                   │ ├─ documentId       │                   │               │
 │                   │ ├─ questionCount:5  │                   │               │
 │                   │ └─ difficulty       │                   │               │
 │                   ├────────────────────▶│                   │               │
 │                   │                     │ Fetch doc chunks ─▶               │
 │                   │                     │◄── chunks ────────│               │
 │                   │                     │ Prompt: generate  │               │
 │                   │                     │ MCQs from chunks ────────────────▶│
 │                   │                     │◄── quiz questions ───────────────│
 │                   │                     │                    │               │
 │                   │                     │ Validate + store  ─▶               │
 │                   │ ◄─ { quizId, Qs }  │                    │               │
 │◄──────────────────┤                     │                    │               │
 │                   │                     │                    │               │
 │ Answer questions  │                     │                    │               │
 ├──────────────────▶│                     │                    │               │
 │                   │ POST /:id/attempt   │                    │               │
 │                   │ ├─ answers[]        │                    │               │
 │                   ├────────────────────▶│                    │               │
 │                   │                     │ Score + store ────▶               │
 │                   │ ◄─ { score, total,  │                    │               │
 │                   │       results[] }   │                    │               │
 │◄─ Show results ───┤                     │                    │               │
 │ & weak topics     │                     │                    │               │
```

## Communication Patterns

### Synchronous REST
- Most CRUD operations (documents, conversations, quizzes, rooms)
- Request → Response within 200-500ms
- Standard JSON payloads

### Server-Sent Events (SSE)
- Chat message endpoint (`POST /api/chat/message`)
- Single POST request returns a stream of events
- Events: `token` | `citation` | `done`
- Backend pushes tokens as the AI provider generates them
- Frontend reads via `ReadableStream`

### WebSockets (Socket.IO)
- Study room real-time chat
- Room presence (who's online)
- Shared quiz sessions (future)
- Managed by NestJS `@nestjs/websockets` gateway

### Presigned URL Upload
- Frontend requests upload URL from backend
- Backend generates Supabase Storage presigned URL (valid for 5 min)
- Frontend uploads directly to Supabase Storage
- Frontend notifies backend to process
- Avoids server-side file buffering

## Security Architecture

```
Layer 1: Network
├── HTTPS everywhere (Vercel + Render)
├── Helmet security headers
├── CORS restricted to frontend domain
└── Rate limiting (nestjs/throttler)

Layer 2: Authentication
├── Clerk-managed sessions
├── Backend verifies JWT via @clerk/clerk-sdk-node
├── No direct DB auth — Clerk is source of truth
└── User record synced to local DB on first request

Layer 3: Authorization
├── ClerkAuthGuard on all protected routes
├── @CurrentUser() decorator for user context
├── Ownership checks in service layer
│   └── "Does userId match the document's userId?"
└── Room membership verification

Layer 4: Input Validation
├── Zod schemas at controller boundary
├── Same schemas shared via @studymate/shared
├── File type/size validation on upload
└── SQL injection prevention (Drizzle parameterized queries)

Layer 5: Secrets
├── All keys in environment variables
├── Never committed to repository
├── .env.example for required variables (without values)
└── GitHub Secrets for CI/CD
```

## Error Handling Strategy

```
All errors follow a consistent shape:
{
  "status": 400,
  "message": "Human-readable error description",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}

Error categories:
├── 400 — Validation errors (Zod schema failures)
├── 401 — Unauthorized (missing/invalid token)
├── 403 — Forbidden (not owner of resource)
├── 404 — Resource not found
├── 409 — Conflict (duplicate, state mismatch)
├── 413 — Payload too large (file exceeds limit)
├── 429 — Rate limited
└── 500 — Internal server error (with Sentry alert)
```

## Performance Considerations

| Component | Strategy | Expected Performance |
|---|---|---|
| **Vector search** | HNSW index with pgvector | <10ms for 100K chunks |
| **PDF processing** | Background async pipeline | 5-15s for 100-page PDF |
| **Chat streaming** | SSE with Gemini streaming | First token < 1s |
| **File upload** | Direct-to-S3 presigned URL | ~2s for 10MB file |
| **Static content** | Vercel edge cache | <100ms TTFB |
| **DB queries** | Drizzle with connection pooling | <20ms typical query |
| **Image loading** | Next.js Image optimization | WebP, lazy loading |
