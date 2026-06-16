# Constants & Limits (@studymate/shared)

All constants are defined in `src/constants.ts`. The file is flat (no subdirectories), organized into logical groups.

## AI Model Configuration

```typescript
/** Gemini embedding model for vector search */
export const EMBEDDING_MODEL = 'text-embedding-004' as const;

/** Output dimensions for text-embedding-004 */
export const EMBEDDING_DIMENSIONS = 768 as const;

/** Gemini chat model for streaming Q&A */
export const CHAT_MODEL = 'gemini-2.0-flash' as const;

/** Default question count when generating quizzes */
export const DEFAULT_QUIZ_QUESTION_COUNT = 5;
```

## Document Chunking

```typescript
/** Maximum characters per semantic chunk */
export const MAX_CHUNK_LENGTH = 1000;

/** Character overlap between adjacent chunks (for context continuity) */
export const CHUNK_OVERLAP = 200;
```

## Trust & Persona System

```typescript
/** Trust levels a user progresses through */
export const TrustLevel = {
  NEW: 'new',
  REGULAR: 'regular',
  TRUSTED: 'trusted',
  CORE: 'core',
} as const;
export type TrustLevel = (typeof TrustLevel)[keyof typeof TrustLevel];

/** Learning personas mapped to trust levels */
export const Persona = {
  EXPLORER: 'explorer',
  FOCUSED: 'focused',
  ACHIEVER: 'achiever',
  MASTER: 'master',
} as const;
export type Persona = (typeof Persona)[keyof typeof Persona];
```

## Session & Trust Thresholds

```typescript
/** Session count required to reach each trust level */
export const SESSION_COUNT_THRESHOLDS = {
  TRUSTED: 5,
  CORE: 20,
} as const;

/** Days without activity before trust level decays */
export const TRUST_DECAY_DAYS = 30;
```

## Persona Display Labels

```typescript
export const PERSONA_LABELS: Record<Persona, string> = {
  explorer: 'Explorer',
  focused: 'Focused Learner',
  achiever: 'Achiever',
  master: 'Master',
};

export const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  explorer: 'Just getting started on your study journey',
  focused: 'Building consistent study habits',
  achiever: 'Making great progress across topics',
  master: 'Demonstrating deep understanding',
};
```

## Constants NOT in Shared Package

The following limits exist only as inline values in their respective apps:

| Constant | Location | Value |
|---|---|---|
| Rate limit | `apps/backend/src/app.module.ts` | 100 req / 60s |
| Max connections | `apps/backend/src/database/` | 20 (pool size) |
| Upload max size | `packages/shared/UploadUrlSchema` | 50MB (in Zod schema) |
| Chat message max | Inline in `chat.controller.ts` | No server-side limit enforced yet |
| Quiz question range | Inline in `quiz.controller.ts` | No server-side limits enforced yet |
