# Shared Package (@studymate/shared)

## Overview

The `@studymate/shared` package contains TypeScript types derived from Zod schemas, constants for AI model config and trust/persona system, and an upload validation schema shared between the backend (NestJS) and frontend (Next.js). This ensures consistency in data shapes and business rules across the stack.

## Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   └── index.ts          # All Zod schemas + inferred types (single file)
│   ├── constants.ts           # AI models, trust/persona, chunk limits
│   └── index.ts              # Public API — re-exports everything
├── tsconfig.json
└── package.json
```

## Usage

```typescript
// Import types and schemas
import { type Document, DocumentStatus, UploadUrlSchema } from '@studymate/shared';

// Use types
const doc: Document = { id: '...', status: DocumentStatus.READY, ... };

// Use schemas for validation
const parsed = UploadUrlSchema.parse({ fileName: 'notes.pdf', ... });

// Use constants
import { CHAT_MODEL, SESSION_COUNT_THRESHOLDS, TrustLevel } from '@studymate/shared';
```

## Key Types (all in `src/types/index.ts`)

| Schema | Inferred Type | Description |
|---|---|---|
| `DocumentSchema` | `Document` | Fields: id, userId, title, fileName, fileSize, mimeType, s3Key, status (pending\|processing\|ready\|error), pageCount?, createdAt, updatedAt |
| `ChunkSchema` | `Chunk` | Fields: id, documentId, content, pageNumber?, heading?, chunkIndex, tokenCount, createdAt |
| `CitationSchema` | `Citation` | chunkId, documentId, documentTitle, pageNumber?, snippet, relevanceScore? |
| `MessageSchema` | `Message` | id, conversationId, role (user\|assistant\|system), content, citations?, tokenCount?, createdAt |
| `ConversationSchema` | `Conversation` | id, userId, title, documentIds?, lastMessageAt?, createdAt, updatedAt |
| `QuizSchema` | `Quiz` | id, userId, title, documentIds, difficulty (beginner\|intermediate\|advanced), questionCount, timeLimit?, createdAt |
| `QuizQuestionSchema` | `QuizQuestion` | id, quizId, questionType, question, options?, correctAnswer, explanation?, sourceChunkId?, order |
| `QuizAttemptSchema` | `QuizAttempt` | id, quizId, userId, answers, score?, startedAt, completedAt? |
| `RoomSchema` | `Room` | id, name, inviteCode, createdBy, createdAt |
| `RoomMemberSchema` | `RoomMember` | id, roomId, userId, role (owner\|member), joinedAt |
| `UploadUrlSchema` | `UploadUrl` | fileName, mimeType (application/pdf), fileSize (≤50MB) |
| `PreviousSessionSchema` | `PreviousSession` | date, topics, quizScore? |
| `ContinuityContextSchema` | `ContinuityContext` | previousSessions, weakAreas, suggestedTopic, lastSessionDate? |
| `TrustMetaSchema` | `TrustMeta` | sessionCount, trustLevel (new\|regular\|trusted\|core), persona (explorer\|focused\|achiever\|master), lastActiveAt?, daysSinceLastActive?, showOnboarding |

## Constants (`src/constants.ts`)

| Export | Description |
|---|---|
| `EMBEDDING_MODEL` | `'text-embedding-004'` |
| `EMBEDDING_DIMENSIONS` | `768` |
| `MAX_CHUNK_LENGTH` | `1000` (characters per chunk) |
| `CHUNK_OVERLAP` | `200` (characters overlap) |
| `CHAT_MODEL` | `'gemini-2.0-flash'` |
| `DEFAULT_QUIZ_QUESTION_COUNT` | `5` |
| `TrustLevel` | Enum: `NEW`, `REGULAR`, `TRUSTED`, `CORE` |
| `Persona` | Enum: `EXPLORER`, `FOCUSED`, `ACHIEVER`, `MASTER` |
| `SESSION_COUNT_THRESHOLDS` | `{ TRUSTED: 5, CORE: 20 }` |
| `TRUST_DECAY_DAYS` | `30` (days before trust decays) |
| `PERSONA_LABELS` | Display labels per persona |
| `PERSONA_DESCRIPTIONS` | Display descriptions per persona |

## Adding New Types/Schemas

1. Add the Zod schema + inferred type to `src/types/index.ts`.
2. Add any new constants to `src/constants.ts`.
3. Export from `src/index.ts`.
4. Run `pnpm --filter @studymate/shared typecheck && pnpm --filter @studymate/shared build`.
5. Update backend and frontend usage.
