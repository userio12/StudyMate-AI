'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';
import { useChatStore } from '@/store/chat-store';

export function useConversations() {
  const api = useApiClient();
  const setConversations = useChatStore((s) => s.setConversations);

  const { data, error, isLoading, mutate } = useSWR('/chat/conversations', (url) =>
    api.get<Array<{ id: string; title: string; lastMessageAt: string | null; isPinned: boolean }>>(url),
  );

  const deleteConversation = async (id: string) => {
    await api.delete(`/chat/conversations/${id}`);
    await mutate();
  };

  const updateConversation = async (id: string, updates: { title?: string; isPinned?: boolean }) => {
    await api.patch(`/chat/conversations/${id}`, updates);
    await mutate();
  };

  useEffect(() => {
    if (data) setConversations(data);
  }, [data, setConversations]);

  return {
    conversations: data ?? [],
    isLoading,
    error,
    mutate,
    deleteConversation,
    updateConversation,
  };
}

export function useConversation(id: string) {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR(
    id ? `/chat/conversations/${id}` : null,
    (url) => api.get<{
      id: string;
      title: string;
      messages: Array<{ id: string; role: string; content: string; citations?: unknown }>;
      continuity?: {
        previousSessions: Array<{ date: string; topics: string[]; quizScore?: { correct: number; total: number } }>;
        weakAreas: string[];
        suggestedTopic: string;
        lastSessionDate?: string;
      };
    }>(url),
  );

  return {
    conversation: data,
    isLoading,
    error,
  };
}
