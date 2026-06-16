import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.js';
import { users } from './users.js';

export const roomMessages = pgTable(
  'room_messages',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    roomIdIdx: index('idx_room_messages_room_id').on(table.roomId),
  }),
);
