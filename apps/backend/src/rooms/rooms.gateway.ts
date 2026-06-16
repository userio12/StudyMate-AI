import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  type OnGatewayInit,
} from '@nestjs/websockets';
import { Server, type Socket } from 'socket.io';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service.js';
import { UserCacheService } from '../common/cache/user-cache.service.js';
import { roomMessages, roomMembers, users } from '@studymate/db';
import { eq, and } from 'drizzle-orm';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
})
export class RoomsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
    private userCache: UserCacheService,
  ) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    this.clerk = createClerkClient({ secretKey: secretKey ?? '' });
  }

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
      const payload = await this.clerk.verifyToken(token);
      const clerkId = payload.sub;

      if (!clerkId) {
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      let userId = this.userCache.get(clerkId);

      if (!userId) {
        const user = await this.db.db!.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!user) {
          client.emit('error', { message: 'User not found' });
          client.disconnect();
          return;
        }

        this.userCache.set(clerkId, user.id);
        userId = user.id;
      }

      client.data.userId = userId;
      console.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const membership = await this.db.db!.query.roomMembers.findFirst({
      where: and(eq(roomMembers.roomId, payload.roomId), eq(roomMembers.userId, userId)),
    });

    if (!membership) {
      client.emit('error', { message: 'Not a member of this room' });
      return;
    }

    client.join(payload.roomId);
    client.to(payload.roomId).emit('user:joined', { userId, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    client.leave(payload.roomId);
    client.to(payload.roomId).emit('user:left', { userId, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('message:send')
  async handleMessage(client: Socket, payload: { roomId: string; content: string }) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !payload.content?.trim()) return;

    const membership = await this.db.db!.query.roomMembers.findFirst({
      where: and(eq(roomMembers.roomId, payload.roomId), eq(roomMembers.userId, userId)),
    });

    if (!membership) {
      client.emit('error', { message: 'Not a member of this room' });
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
    if (userId) {
      client.to(payload.roomId).emit('typing:update', { userId, typing: true });
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      client.to(payload.roomId).emit('typing:update', { userId, typing: false });
    }
  }
}
