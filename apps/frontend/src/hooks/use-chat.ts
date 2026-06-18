'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';
import { useChatStore } from '@/store/chat-store';

export function useConversations() {
  const api = useApiClient();
  const setConversations = useChatStore((s) => s.setConversations);

  const { data, error, isLoading, mutate } = useSWR('/chat/conversations', (url) =>
    api.get<Array<{ id: string; title: string; lastMessageAt: string | null }>>(url),
  );

  useEffect(() => {
    if (data) setConversations(data);
  }, [data, setConversations]);

  return {
    conversations: data ?? [],
    isLoading,
    error,
    mutate,
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
