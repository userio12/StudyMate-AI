'use client';

import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';

export function useQuizzes() {
  const api = useApiClient();

  const { data, error, isLoading, mutate } = useSWR('/quiz/list', (url) =>
    api.get<Array<{ id: string; title: string; difficulty: string; questionCount: number; createdAt: string }>>(url),
  );

  return {
    quizzes: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useQuiz(id: string) {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR(
    id ? `/quiz/${id}` : null,
    (url) => api.get<{ id: string; title: string; difficulty: string; questions: Array<{ id: string; question: string; questionType: string; options?: string[] }> }>(url),
  );

  return {
    quiz: data,
    isLoading,
    error,
  };
}

export function useAttempts() {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR('/quiz/attempts', (url) =>
    api.get<Array<{ id: string; quizId: string; score: number | null; startedAt: string; completedAt: string | null }>>(url),
  );

  return {
    attempts: data ?? [],
    isLoading,
    error,
  };
}
