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
