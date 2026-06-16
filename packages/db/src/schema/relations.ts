import { relations } from 'drizzle-orm';
import { rooms } from './rooms.js';
import { roomMembers } from './room-members.js';

export const roomsRelations = relations(rooms, ({ many }) => ({
  members: many(roomMembers),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
}));
