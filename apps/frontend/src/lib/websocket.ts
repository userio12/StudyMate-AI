import { io, type Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

// FIX BUG-30: Accept a getToken callback instead of a static token string.
// Socket.IO supports a function for `auth` which is called on every connection
// attempt — including auto-reconnects — so the token stays fresh even after
// the original session expires during a long disconnect.
type TokenGetter = () => Promise<string | null>;

class SocketManager {
  private socket: Socket | null = null;
  private refCount = 0;

  getSocket(getToken: TokenGetter): Socket {
    if (!this.socket?.connected) {
      if (this.socket) {
        // Existing disconnected socket — clean it up before creating a new one
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(WS_URL, {
        // FIX BUG-30: auth is a callback — called fresh on each connection attempt
        auth: (cb) => {
          getToken()
            .then((token) => cb({ token: token ?? '' }))
            .catch(() => cb({ token: '' }));
        },
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
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    }
  }
}

const manager = new SocketManager();

export function getSocket(getToken: TokenGetter): Socket {
  return manager.getSocket(getToken);
}

export function disconnectSocket() {
  manager.releaseSocket();
}
