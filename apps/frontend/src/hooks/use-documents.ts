'use client';

import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';

export function useDocuments() {
  const api = useApiClient();

  const { data, error, isLoading, mutate } = useSWR('/documents', (url) =>
    api.get<Array<{ id: string; title: string; fileName: string; status: string; createdAt: string }>>(url),
  );

  return {
    documents: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useDocument(id: string) {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR(
    id ? `/documents/${id}` : null,
    (url) => api.get<{ id: string; title: string; fileName: string; status: string; createdAt: string }>(url),
  );

  return {
    document: data,
    isLoading,
    error,
  };
}
