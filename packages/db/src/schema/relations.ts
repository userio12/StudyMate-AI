import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { documents } from './documents.js';
import { chunks } from './chunks.js';
import { conversations } from './conversations.js';
import { messages } from './messages.js';
import { quizzes } from './quizzes.js';
import { quizQuestions } from './quiz-questions.js';
import { quizAttempts } from './quiz-attempts.js';
import { rooms } from './rooms.js';
import { roomMembers } from './room-members.js';
import { roomMessages } from './room-messages.js';
import { conversationDocuments } from './conversation-documents.js';
import { quizDocuments } from './quiz-documents.js';
import { subjects } from './subjects.js';
import { tasks } from './tasks.js';
import { studySessions } from './study-sessions.js';
import { goals } from './goals.js';
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  conversations: many(conversations),
  quizzes: many(quizzes),
  quizAttempts: many(quizAttempts),
  roomMemberships: many(roomMembers),
  roomsCreated: many(rooms),
  roomMessages: many(roomMessages),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  chunks: many(chunks),
  conversationDocuments: many(conversationDocuments),
  quizDocuments: many(quizDocuments),
}));

export const chunksRelations = relations(chunks, ({ one, many }) => ({
  document: one(documents, {
    fields: [chunks.documentId],
    references: [documents.id],
  }),
  quizQuestions: many(quizQuestions),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  documents: many(conversationDocuments),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  user: one(users, {
    fields: [quizzes.userId],
    references: [users.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
  documents: many(quizDocuments),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  sourceChunk: one(chunks, {
    fields: [quizQuestions.sourceChunkId],
    references: [chunks.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [rooms.createdBy],
    references: [users.id],
  }),
  members: many(roomMembers),
  messages: many(roomMessages),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  user: one(users, {
    fields: [roomMembers.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
}));

export const roomMessagesRelations = relations(roomMessages, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMessages.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomMessages.userId],
    references: [users.id],
  }),
}));

export const conversationDocumentsRelations = relations(conversationDocuments, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationDocuments.conversationId],
    references: [conversations.id],
  }),
  document: one(documents, {
    fields: [conversationDocuments.documentId],
    references: [documents.id],
  }),
}));

export const quizDocumentsRelations = relations(quizDocuments, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizDocuments.quizId],
    references: [quizzes.id],
  }),
  document: one(documents, {
    fields: [quizDocuments.documentId],
    references: [documents.id],
  }),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, {
    fields: [subjects.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  studySessions: many(studySessions),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [tasks.subjectId],
    references: [subjects.id],
  }),
  studySessions: many(studySessions),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, {
    fields: [studySessions.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [studySessions.subjectId],
    references: [subjects.id],
  }),
  task: one(tasks, {
    fields: [studySessions.taskId],
    references: [tasks.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));
