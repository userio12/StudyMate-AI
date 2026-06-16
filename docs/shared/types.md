# Type Definitions (@studymate/shared)

All types are defined in `src/types/index.ts` via Zod schemas. The actual TypeScript types are inferred using `z.infer<typeof Schema>`.

## Enums (string const objects)

```typescript
export const DocumentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const DifficultyLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

export const QuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
```

## Document

```typescript
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(500),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  s3Key: z.string(),
  status: z.nativeEnum(DocumentStatus),
  pageCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

## Chunk (vectorized document segments)

```typescript
export const ChunkSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  content: z.string().min(1),
  pageNumber: z.number().int().nonnegative().optional(),
  heading: z.string().optional(),
  chunkIndex: z.number().int().nonnegative(),
  tokenCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
```

## Chat (Messages & Conversations)

```typescript
export const CitationSchema = z.object({
  chunkId: z.string().uuid(),
  documentId: z.string().uuid(),
  documentTitle: z.string(),
  pageNumber: z.number().int().nonnegative().optional(),
  snippet: z.string(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.nativeEnum(MessageRole),
  content: z.string().min(1),
  citations: z.array(CitationSchema).optional(),
  tokenCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(300),
  documentIds: z.array(z.string().uuid()).optional(),
  lastMessageAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

## Quiz

```typescript
export const QuizQuestionSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  questionType: z.nativeEnum(QuestionType),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  sourceChunkId: z.string().uuid().optional(),
  order: z.number().int().nonnegative(),
});

export const QuizSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string(),
  documentIds: z.array(z.string().uuid()),
  difficulty: z.nativeEnum(DifficultyLevel),
  questionCount: z.number().int().positive(),
  timeLimit: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
});

export const QuizAttemptSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  userId: z.string(),
  answers: z.record(z.string(), z.string()),
  score: z.number().min(0).max(100).optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});
```

## Room

```typescript
export const RoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  inviteCode: z.string().min(6).max(20),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
});

export const RoomMemberSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string(),
  role: z.enum(['owner', 'member']),
  joinedAt: z.string().datetime(),
});
```

## Upload URL

```typescript
export const UploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf']),
  fileSize: z.number().positive().max(50 * 1024 * 1024),
});
```

## Trust & Continuity

```typescript
export const PreviousSessionSchema = z.object({
  date: z.string().datetime(),
  topics: z.array(z.string()),
  quizScore: z.object({ correct: z.number(), total: z.number() }).optional(),
});

export const ContinuityContextSchema = z.object({
  previousSessions: z.array(PreviousSessionSchema),
  weakAreas: z.array(z.string()),
  suggestedTopic: z.string(),
  lastSessionDate: z.string().datetime().optional(),
});

export const TrustMetaSchema = z.object({
  sessionCount: z.number().int().nonnegative(),
  trustLevel: z.nativeEnum(TrustLevel),
  persona: z.nativeEnum(Persona),
  lastActiveAt: z.string().datetime().optional(),
  daysSinceLastActive: z.number().int().nonnegative().optional(),
  showOnboarding: z.boolean(),
});
```

## Types NOT in Shared Package

The following types exist only locally in their respective apps and have not been elevated to `@studymate/shared`:

| Type | Location | Notes |
|---|---|---|
| `CreateUploadUrlDto` | `apps/backend/src/documents/dto/` | Re-exports `UploadUrlSchema` from shared |
| `CurrentUserPayload` | `apps/backend/src/auth/decorators/` | `{ userId: string }` |
| `Config` | `apps/backend/src/config/` | Backend env config schema |
| SSE event types | Frontend `api-client.ts` | Parsed inline, no shared types |
| Room message (WebSocket) | Frontend `chat-interface.tsx` | Local `Message` interface |
| Pagination types | Not implemented anywhere | No pagination exists yet |
| API response envelope | Not implemented anywhere | `TransformInterceptor` exists but types not shared |
