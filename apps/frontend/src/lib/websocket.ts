import { io, type Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

class SocketManager {
  private socket: Socket | null = null;
  private refCount = 0;

  getSocket(token: string): Socket {
    if (!this.socket?.connected) {
      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
      });
      
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });
    }
    
    this.refCount++;
    return this.socket;
  }

  releaseSocket() {
    this.refCount--;
    if (this.refCount <= 0) {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.refCount = 0;
    }
  }
}

const manager = new SocketManager();

export function getSocket(token: string): Socket {
  return manager.getSocket(token);
}

export function disconnectSocket() {
  manager.releaseSocket();
}
