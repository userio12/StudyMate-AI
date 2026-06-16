import { z } from 'zod';

// ── Document ──────────────────────────────────────────────
export const DocumentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

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

export type Document = z.infer<typeof DocumentSchema>;

// ── Chunk ──────────────────────────────────────────────────
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

export type Chunk = z.infer<typeof ChunkSchema>;

// ── Conversation & Message ────────────────────────────────
export const CitationSchema = z.object({
  chunkId: z.string().uuid(),
  documentId: z.string().uuid(),
  documentTitle: z.string(),
  pageNumber: z.number().int().nonnegative().optional(),
  snippet: z.string(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

export type Citation = z.infer<typeof CitationSchema>;

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.nativeEnum(MessageRole),
  content: z.string().min(1),
  citations: z.array(CitationSchema).optional(),
  tokenCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(300),
  documentIds: z.array(z.string().uuid()).optional(),
  lastMessageAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// ── Quiz ───────────────────────────────────────────────────
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

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

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

export type Quiz = z.infer<typeof QuizSchema>;

export const QuizAttemptSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  userId: z.string(),
  answers: z.record(z.string(), z.string()),
  score: z.number().min(0).max(100).optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;

// ── Upload ─────────────────────────────────────────────────
export const UploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf']),
  fileSize: z.number().positive().max(50 * 1024 * 1024),
});

export type UploadUrl = z.infer<typeof UploadUrlSchema>;

// ── Request Bodies ─────────────────────────────────────────
export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(200),
});
export type CreateRoomDto = z.infer<typeof CreateRoomSchema>;

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(300),
  documentIds: z.array(z.string().uuid()).optional(),
});
export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});
export type SendMessageDto = z.infer<typeof SendMessageSchema>;

export const GenerateQuizSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1, 'At least one document is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  questionCount: z.number().int().positive().max(50).optional(),
});
export type GenerateQuizDto = z.infer<typeof GenerateQuizSchema>;

export const SubmitAttemptSchema = z.object({
  answers: z.record(z.string(), z.string()),
});
export type SubmitAttemptDto = z.infer<typeof SubmitAttemptSchema>;

// ── Pagination ─────────────────────────────────────────────
export const PaginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type Pagination = z.infer<typeof PaginationSchema>;

// ── Room ───────────────────────────────────────────────────
export const RoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  inviteCode: z.string().min(6).max(20),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
});

export type Room = z.infer<typeof RoomSchema>;

export const RoomMemberSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string(),
  role: z.enum(['owner', 'member']),
  joinedAt: z.string().datetime(),
});

export type RoomMember = z.infer<typeof RoomMemberSchema>;

// ── Trust & Persona ───────────────────────────────────────
import {
  TrustLevel as _TrustLevel,
  Persona as _Persona,
} from '../constants.js';

// ── Continuity ────────────────────────────────────────────
export const PreviousSessionSchema = z.object({
  date: z.string().datetime(),
  topics: z.array(z.string()),
  quizScore: z.object({
    correct: z.number(),
    total: z.number(),
  }).optional(),
});
export type PreviousSession = z.infer<typeof PreviousSessionSchema>;

export const ContinuityContextSchema = z.object({
  previousSessions: z.array(PreviousSessionSchema),
  weakAreas: z.array(z.string()),
  suggestedTopic: z.string(),
  lastSessionDate: z.string().datetime().optional(),
});
export type ContinuityContext = z.infer<typeof ContinuityContextSchema>;

export const TrustMetaSchema = z.object({
  sessionCount: z.number().int().nonnegative(),
  trustLevel: z.nativeEnum(_TrustLevel),
  persona: z.nativeEnum(_Persona),
  lastActiveAt: z.string().datetime().optional(),
  daysSinceLastActive: z.number().int().nonnegative().optional(),
  showOnboarding: z.boolean(),
});
export type TrustMeta = z.infer<typeof TrustMetaSchema>;
