import { index, pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.js';
import { users } from './users.js';

export const memberRoleEnum = pgEnum('member_role', ['owner', 'member']);

export const roomMembers = pgTable(
  'room_members',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').default('member').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    roomIdIdx: index('idx_room_members_room_id').on(table.roomId),
    userIdIdx: index('idx_room_members_user_id').on(table.userId),
  }),
);
