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

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const payload = await this.clerkAuth.verifyToken(token);
        const clerkId = payload.sub;

        if (!clerkId) {
          return next(new Error('Invalid token'));
        }

        const user = await this.clerkAuth.getOrCreateUser(clerkId);
        
        socket.data.userId = user.id;
        socket.data.rooms = new Set<string>();
        socket.data.typingRooms = new Set<string>();
        socket.data.presence = 'online'; // Default to online
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });
    console.log('Socket.IO gateway initialized with auth middleware');
  }

  handleConnection(client: Socket) {
    if (client.data.userId) {
      console.log(`Client connected: ${client.id} (user: ${client.data.userId})`);
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
    
    // Only broadcast user:joined if the user's presence is online
    if (client.data.presence !== 'offline') {
      client.to(payload.roomId).emit('user:joined', { userId, timestamp: new Date().toISOString() });
    }
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

  @SubscribeMessage('presence:update')
  handlePresenceUpdate(client: Socket, payload: { status: 'online' | 'offline' }) {
    const userId = client.data.userId as string | undefined;
    const rooms = client.data.rooms as Set<string> | undefined;
    
    if (!userId || !rooms) return;

    // Prevent unnecessary broadcasts if status hasn't changed
    if (client.data.presence === payload.status) return;

    client.data.presence = payload.status;
    
    // Broadcast the status change to all rooms the user is currently in
    for (const roomId of rooms) {
      if (payload.status === 'offline') {
        client.to(roomId).emit('user:left', { userId, timestamp: new Date().toISOString() });
      } else {
        client.to(roomId).emit('user:joined', { userId, timestamp: new Date().toISOString() });
      }
    }
  }
}
