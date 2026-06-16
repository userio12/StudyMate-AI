'use client';

import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';

interface AnalyticsStats {
  documents: number;
  conversations: number;
  quizzes: number;
  averageScore: number | null;
  recentActivity: Array<{ date: string; count: number }>;
}

export function useAnalytics() {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR('/analytics/stats', (url) =>
    api.get<AnalyticsStats>(url),
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}
