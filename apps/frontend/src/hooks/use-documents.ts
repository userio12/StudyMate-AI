'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';
import type { Document } from '@studymate/shared';

export function useDocuments() {
  const api = useApiClient();

  const { data, error, isLoading, mutate } = useSWR(
    '/documents',
    (url) => api.get<Document[]>(url),
    {
      dedupingInterval: 0,
      refreshWhenHidden: true,
    },
  );

  // Poll every 3s while any document is pending/processing.
  // We use useEffect + setInterval instead of SWR's function-based refreshInterval
  // because SWR has a bug where refreshInterval(fn) returning 0 on the initial call
  // (before data loads) never re-evaluates after data changes via mutate().
  useEffect(() => {
    const hasPending = data?.some(
      (d) => d.status === 'processing' || d.status === 'pending',
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      mutate();
    }, 3000);

    return () => clearInterval(interval);
  }, [data, mutate]);

  const deleteDocument = async (id: string) => {
    await api.delete(`/documents/${id}`);
    await mutate();
  };

  const updateDocument = async (id: string, updates: { title?: string; isPinned?: boolean }) => {
    await api.patch(`/documents/${id}`, updates);
    await mutate();
  };

  return {
    documents: data ?? [],
    isLoading,
    error,
    mutate,
    deleteDocument,
    updateDocument,
  };
}

function useDocument(id: string) {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR(
    id ? `/documents/${id}` : null,
    (url) => api.get<Document>(url),
  );

  return {
    document: data,
    isLoading,
    error,
  };
}
