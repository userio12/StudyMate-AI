import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { rooms, roomMembers, roomMessages } from '@studymate/db';
import { eq, and, desc } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

@Injectable()
export class RoomsService {
  constructor(private db: DatabaseService) {}

  async createRoom(name: string, userId: string) {
    const id = crypto.randomUUID();
    const inviteCode = randomBytes(4).toString('hex');

    await this.db.db!.transaction(async (tx) => {
      await tx.insert(rooms).values({ id, name, inviteCode, createdBy: userId });
      await tx.insert(roomMembers).values({ id: crypto.randomUUID(), roomId: id, userId, role: 'owner' });
    });

    return { id, name, inviteCode };
  }

  async joinRoom(inviteCode: string, userId: string) {
    const room = await this.db.db!.query.rooms.findFirst({
      where: eq(rooms.inviteCode, inviteCode),
    });

    if (!room) throw new NotFoundException('Room not found');

    const existing = await this.db.db!.query.roomMembers.findFirst({
      where: and(eq(roomMembers.roomId, room.id), eq(roomMembers.userId, userId)),
    });

    if (existing) throw new ConflictException('Already a member');

    await this.db.db!.insert(roomMembers).values({
      id: crypto.randomUUID(),
      roomId: room.id,
      userId,
      role: 'member',
    });

    return { id: room.id, name: room.name };
  }

  async listRooms(userId: string) {
    const memberships = await this.db.db!.query.roomMembers.findMany({
      where: eq(roomMembers.userId, userId),
      with: {
        room: true,
      },
    });

    return memberships.map((m) => m.room);
  }

  async getRoom(id: string, userId: string) {
    const room = await this.db.db!.query.rooms.findFirst({
      where: eq(rooms.id, id),
    });

    if (!room) throw new NotFoundException('Room not found');

    const members = await this.db.db!.query.roomMembers.findMany({
      where: eq(roomMembers.roomId, id),
    });

    return { ...room, members };
  }

  async getMessages(roomId: string) {
    return this.db.db!.query.roomMessages.findMany({
      where: eq(roomMessages.roomId, roomId),
      orderBy: desc(roomMessages.createdAt),
      limit: 50,
    });
  }
}
