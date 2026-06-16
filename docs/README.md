# StudyMate AI — Documentation

> **Turn your PDFs into your personal AI tutor.**  
> RAG-powered study assistant with vector search, streaming chat, and adaptive quiz generation.

## Documentation Contents

### Architecture
- [System Architecture](architecture.md) — High-level overview of the entire system

### Backend (`apps/backend/`)
| Document | Description |
|---|---|
| [Overview & Setup](backend/overview.md) | Tech stack, project structure, local setup |
| [NestJS Architecture](backend/architecture.md) | Module structure, guards, interceptors, pipes |
| [API Reference](backend/api-reference.md) | All REST endpoints with request/response schemas |
| [Database Schema](backend/database-schema.md) | Drizzle ORM tables, indexes, relationships |
| [RAG Pipeline](backend/rag-pipeline.md) | PDF ingestion, chunking, embedding, vector search, streaming chat |
| [Authentication](backend/auth.md) | Clerk JWT verification, auth guard, user sync |
| [AI Services](backend/ai-services.md) | Gemini integration, embeddings, quiz generation |
| [Storage Service](backend/storage.md) | AWS S3 presigned URLs, file management |
| [Testing](backend/testing.md) | Unit, integration, and E2E testing strategy |
| [Deployment](backend/deployment.md) | Docker, Render, environment variables |
| [Contributing](backend/contributing.md) | Code style, commit conventions, PR process |

### Frontend (`apps/frontend/`)
| Document | Description |
|---|---|
| [Overview & Setup](frontend/overview.md) | Tech stack, project structure, local setup |
| [Next.js Architecture](frontend/architecture.md) | App Router, layout hierarchy, server vs client, Suspense boundaries, bundle budgets |
| [Design System](frontend/design-system.md) | Colors (terracotta + parchment), typography (Fraunces + Space Grotesk), Studymate Glow, typographic rules |
| [Component Library](frontend/components.md) | All shadcn/custom components with compound composition patterns, touch targets |
| [AI Relationship Design](frontend/ai-relationship-design.md) | Memory, adaptive difficulty, session continuity, persona states, trust progression |
| [State Management](frontend/state-management.md) | Zustand stores, SWR caching, streaming state |
| [API Integration](frontend/api-integration.md) | API client, hooks, error handling |
| [Routing](frontend/routing.md) | Route map, middleware, protected routes |
| [Testing](frontend/testing.md) | Vitest, Testing Library, Playwright E2E |
| [Deployment](frontend/deployment.md) | Vercel, environment variables, CI/CD |
| [Accessibility](frontend/accessibility.md) | ARIA, keyboard nav, contrast, high contrast mode, reduced data, color-scheme, autocomplete |
| [Contributing](frontend/contributing.md) | Code style, component conventions, PR process |

### Shared Packages
| Document | Description |
|---|---|
| [Shared Package Overview](shared/overview.md) | Types, validation, constants shared across projects |
| [Type Definitions](shared/types.md) | All TypeScript interfaces and enums |
| [Validation Schemas](shared/validation.md) | Zod schemas for runtime validation |
| [Constants & Limits](shared/constants.md) | Shared configuration values |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/studymate-ai.git
cd studymate-ai

# Install dependencies (pnpm + workspaces)
pnpm install

# Set up environment variables
cp .env.example .env.local

# Generate database migrations
pnpm db:generate

# Run migrations against your Supabase instance
pnpm db:migrate

# Start both backend and frontend in development mode
pnpm dev
```

The backend starts at `http://localhost:4000` and the frontend at `http://localhost:3000`.

## Technology Stack

| Layer | Technology |
|---|---|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Backend** | NestJS + TypeScript |
| **Frontend** | Next.js 15 App Router + TypeScript |
| **Database** | Supabase (Postgres + pgvector) |
| **ORM** | Drizzle |
| **Auth** | Clerk |
| **AI** | Google Gemini (embeddings + chat) |
| **Storage** | AWS S3 |
| **UI** | Tailwind CSS + shadcn/ui + Framer Motion |
| **Testing** | Vitest + Playwright + Storybook |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel (frontend) + Render (backend) |
