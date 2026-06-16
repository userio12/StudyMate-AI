'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';
import type { Socket } from 'socket.io-client';
import { useApiClient } from '@/lib/api-client';
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

  const { data: history } = useSWR(
    roomId ? `/rooms/${roomId}/messages` : null,
    (url) => api.get<ChatMessage[]>(url),
  );

  useEffect(() => {
    if (history) {
      setMessages(history.reverse());
    }
  }, [history]);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const token = await getToken({ template: 'studymate-ai' });
      if (!token || cancelled) return;

      const socket = getSocket(token);
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
        disconnectSocket();
        socketRef.current = null;
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
