# StudyMate AI: Project Context & Guidelines

StudyMate AI is a comprehensive, AI-powered study platform built as a full-stack TypeScript monorepo. It enables users to upload study materials (PDFs), engage in context-aware chats with source citations, and generate adaptive quizzes based on their documents.

## Project Overview

- **Architecture:** Monorepo managed by [Turborepo](https://turbo.build/) and [pnpm](https://pnpm.io/).
- **Backend (`apps/backend`):** [NestJS](https://nestjs.com/) API providing RAG (Retrieval-Augmented Generation) services, real-time study rooms via Socket.IO, and document management.
- **Frontend (`apps/frontend`):** [Next.js 15](https://nextjs.org/) (App Router) with [Tailwind CSS v4](https://tailwindcss.com/) for a modern, responsive user experience.
- **Database (`packages/db`):** PostgreSQL with `pgvector` for semantic search, managed via [Drizzle ORM](https://orm.drizzle.team/).
- **AI Integration:** Google Gemini for LLM tasks (chat, quiz generation) and embeddings.
- **Authentication:** [Clerk](https://clerk.com/) for user identity and session management.
- **Storage:** AWS S3 for document persistence.

## Project Structure

```text
StudyMate-AI/
├── apps/
│   ├── backend/          # NestJS application (API, AI services, WebSockets)
│   └── frontend/         # Next.js application (UI, dashboard, chat interface)
├── packages/
│   ├── db/               # Database schema, migrations, and Drizzle client
│   └── shared/           # Common types, Zod schemas, and constants
├── docs/                 # Comprehensive system documentation
├── docker/               # Containerization configurations
└── turbo.json            # Turborepo pipeline definition
```

## Building and Running

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker (for local database)

### Key Commands
- **Install Dependencies:** `pnpm install`
- **Development Mode:** `pnpm dev` (Runs all apps and packages in watch mode)
- **Build Project:** `pnpm build`
- **Run Tests:** `pnpm test` (Runs Vitest for unit/integration and Playwright for E2E)
- **Linting:** `pnpm lint`
- **Type Checking:** `pnpm typecheck`
- **Database Management:**
  - `pnpm --filter @studymate/db db:generate` (Generate migrations)
  - `pnpm --filter @studymate/db db:push` (Push schema to DB)
  - `pnpm --filter @studymate/db db:studio` (Open Drizzle Studio)

## Development Conventions

### Code Style & Quality
- **Language:** TypeScript for everything.
- **Formatting:** Prettier (see `.prettierrc`).
- **Linting:** ESLint with strict TypeScript rules.
- **Validation:** Use [Zod](https://zod.dev/) for all runtime validation (API requests, environment variables). Shared schemas should live in `packages/shared`.

### Backend (NestJS)
- Follow standard NestJS modular architecture.
- Use `DrizzleModule` for database access.
- Implement security via `ClerkAuthGuard` and `helmet`.
- Services should be lean, delegating AI logic to specialized providers (e.g., `AiService`, `RagService`).

### Frontend (Next.js)
- Use React Server Components (RSC) by default; use `'use client'` only when interactivity is required.
- Data fetching should prefer SWR for client-side caching.
- Styling follows Tailwind CSS v4 patterns.

### Testing
- **Unit/Integration:** [Vitest](https://vitest.dev/).
- **E2E:** [Playwright](https://playwright.dev/).
- Always add tests for new features or bug fixes.

## Critical Workflows
- **PDF Processing:** Documents are uploaded to S3 via presigned URLs, then processed asynchronously (text extraction -> chunking -> embedding -> vector store).
- **RAG Chat:** Uses semantic search on `pgvector` to retrieve context, which is then fed to Gemini with a system prompt optimized for citations.
- **Real-time:** Study rooms use Socket.IO for low-latency collaboration.
