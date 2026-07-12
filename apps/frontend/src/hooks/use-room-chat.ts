'use client';
/* eslint-disable react-compiler/react-compiler */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';
import type { Socket } from 'socket.io-client';
import { useApiClient, CLERK_JWT_TEMPLATE } from '@/lib/api-client';
import { getSocket, disconnectSocket } from '@/lib/websocket';
import { useUiStore } from '@/store/ui-store';

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
  const { presence } = useUiStore();
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
      const timer = setTimeout(() => {
        setMessages([...history].reverse());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    socketAcquired.current = false;

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
    socket.emit('presence:update', { status: presence });

    socket.on('message:received', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user:joined', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    socket.on('user:left', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on('typing:update', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('error', (err: { message: string }) => {
      console.error('Room error:', err.message);
    });

    return () => {
      cancelled = true;
      socket.emit('leave:room', { roomId });
      socket.off('message:received');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('typing:update');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socketRef.current = null;
      // FIX BUG-27: Only release the socket if we successfully acquired it.
      // Without this guard, a rapid unmount before the async token fetch
      // finishes would decrement refCount without a matching increment.
      if (socketAcquired.current) {
        disconnectSocket();
        socketAcquired.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, getToken]);

  // Sync presence changes
  useEffect(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('presence:update', { status: presence });
    }
  }, [presence, isConnected]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit('message:send', { roomId, content });
  };

  const handleTyping = (typing: boolean) => {
    if (typing) {
      socketRef.current?.emit('typing:start', { roomId });
    } else {
      socketRef.current?.emit('typing:stop', { roomId });
    }
  };

  const handleInputChange = () => {
    handleTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => handleTyping(false), 2000);
  };

  return {
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    sendMessage,
    handleInputChange,
  };
}
