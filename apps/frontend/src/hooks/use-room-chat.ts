'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';
import type { Socket } from 'socket.io-client';
import { useApiClient, CLERK_JWT_TEMPLATE } from '@/lib/api-client';
import { getSocket, disconnectSocket } from '@/lib/websocket';

interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export function useRoomChat(roomId: string) {
  const { getToken } = useAuth();
  const api = useApiClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // FIX BUG-27: Track whether the socket was actually acquired so disconnectSocket()
  // is only called if getSocket() was successfully called, preventing the refCount
  // from going negative on rapid mount/unmount before token fetch completes.
  const socketAcquired = useRef(false);

  const { data: history } = useSWR(
    roomId ? `/rooms/${roomId}/messages` : null,
    (url) => api.get<ChatMessage[]>(url),
  );

  useEffect(() => {
    if (history) {
      // FIX BUG-25: Spread into a new array before reversing to avoid mutating the
      // original SWR-cached array in place. Mutating cached data causes SWR to see
      // the data as changed on the next render and triggers spurious re-fetches.
      setMessages([...history].reverse());
    }
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    socketAcquired.current = false;

    async function connect() {
      if (cancelled) return;

      // FIX BUG-26: Use the shared CLERK_JWT_TEMPLATE constant from api-client
      // instead of a hardcoded string. This ensures both auth mechanisms (REST API
      // and WebSocket) always use the same template name.
      //
      // FIX BUG-30: Pass a token-getter function to getSocket() instead of a static
      // token string. The SocketManager uses it as a callback that is invoked on
      // every connection attempt (including reconnects), so the token stays fresh.
      const tokenGetter = () => getToken({ template: CLERK_JWT_TEMPLATE }).then((t) => t ?? null);

      const socket = getSocket(tokenGetter);
      if (cancelled) {
        // Component unmounted between getSocket() and here — release immediately
        disconnectSocket();
        return;
      }

      socketAcquired.current = true;
      socketRef.current = socket;

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.emit('join:room', { roomId });

      socket.on('message:received', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('user:joined', ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      });

      socket.on('user:left', ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      socket.on('typing:update', ({ userId, typing }: { userId: string; typing: boolean }) => {
        setTypingUsers((prev) =>
          typing
            ? prev.includes(userId) ? prev : [...prev, userId]
            : prev.filter((id) => id !== userId),
        );
      });

      socket.on('error', ({ message }: { message: string }) => {
        console.error('Socket error:', message);
      });
    }

    connect();

    return () => {
      cancelled = true;
      const s = socketRef.current;
      if (s) {
        s.emit('leave:room', { roomId });
        s.off('message:received');
        s.off('user:joined');
        s.off('user:left');
        s.off('typing:update');
        s.off('error');
        s.off('connect');
        s.off('disconnect');
        socketRef.current = null;
      }
      // FIX BUG-27: Only release the socket if we successfully acquired it.
      // Without this guard, a rapid unmount before the async token fetch
      // finishes would decrement refCount without a matching increment.
      if (socketAcquired.current) {
        disconnectSocket();
        socketAcquired.current = false;
      }
    };
  }, [roomId, getToken]);

  const sendMessage = useCallback((content: string) => {
    socketRef.current?.emit('message:send', { roomId, content });
  }, [roomId]);

  const handleTyping = useCallback((typing: boolean) => {
    if (typing) {
      socketRef.current?.emit('typing:start', { roomId });
    } else {
      socketRef.current?.emit('typing:stop', { roomId });
    }
  }, [roomId]);

  const handleInputChange = useCallback(() => {
    handleTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => handleTyping(false), 2000);
  }, [handleTyping]);

  return {
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    sendMessage,
    handleInputChange,
  };
}
