import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  type OnGatewayInit,
} from '@nestjs/websockets';
import { Server, type Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service.js';
import { roomMessages, roomMembers } from '@studymate/db';
import { eq, and } from 'drizzle-orm';
import { ClerkAuthService } from '../auth/clerk-auth.service.js';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
})
export class RoomsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private db: DatabaseService,
    private clerkAuth: ClerkAuthService,
  ) {}

  afterInit() {
    console.log('Socket.IO gateway initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const payload = await this.clerkAuth.verifyToken(token);
      const clerkId = payload.sub;

      if (!clerkId) {
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      const user = await this.clerkAuth.getOrCreateUser(clerkId);
      
      client.data.userId = user.id;
      client.data.rooms = new Set<string>();
      client.data.typingRooms = new Set<string>();
      console.log(`Client connected: ${client.id} (user: ${user.id})`);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    const typingRooms = client.data.typingRooms as Set<string> | undefined;
    if (userId && typingRooms) {
      for (const roomId of typingRooms) {
        client.to(roomId).emit('typing:update', { userId, typing: false });
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    const rooms = client.data.rooms as Set<string> | undefined;
    if (!userId || !rooms) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    if (rooms.has(payload.roomId)) return;

    const membership = await this.db.db!.query.roomMembers.findFirst({
      where: and(eq(roomMembers.roomId, payload.roomId), eq(roomMembers.userId, userId)),
    });

    if (!membership) {
      client.emit('error', { message: 'Not a member of this room' });
      return;
    }

    rooms.add(payload.roomId);
    client.join(payload.roomId);
    client.to(payload.roomId).emit('user:joined', { userId, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    const rooms = client.data.rooms as Set<string> | undefined;
    const typingRooms = client.data.typingRooms as Set<string> | undefined;
    
    rooms?.delete(payload.roomId);
    typingRooms?.delete(payload.roomId);
    
    client.leave(payload.roomId);
    client.to(payload.roomId).emit('user:left', { userId, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('message:send')
  async handleMessage(client: Socket, payload: { roomId: string; content: string }) {
    const userId = client.data.userId as string | undefined;
    const rooms = client.data.rooms as Set<string> | undefined;
    
    if (!userId || !rooms || !payload.content?.trim()) return;

    if (!rooms.has(payload.roomId)) {
      client.emit('error', { message: 'Not in this room. Please join first.' });
      return;
    }

    const id = crypto.randomUUID();

    await this.db.db!.insert(roomMessages).values({
      id,
      roomId: payload.roomId,
      userId,
      content: payload.content,
    });

    this.server.to(payload.roomId).emit('message:received', {
      id,
      userId,
      content: payload.content,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    const typingRooms = client.data.typingRooms as Set<string> | undefined;
    if (userId && typingRooms) {
      typingRooms.add(payload.roomId);
      client.to(payload.roomId).emit('typing:update', { userId, typing: true });
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    const typingRooms = client.data.typingRooms as Set<string> | undefined;
    if (userId && typingRooms) {
      typingRooms.delete(payload.roomId);
      client.to(payload.roomId).emit('typing:update', { userId, typing: false });
    }
  }
}
