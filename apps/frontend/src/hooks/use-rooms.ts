'use client';

import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';

export function useRooms() {
  const api = useApiClient();

  const { data, error, isLoading, mutate } = useSWR('/rooms', (url) =>
    api.get<Array<{ id: string; name: string; inviteCode: string; createdAt: string }>>(url),
  );

  return {
    rooms: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useRoom(id: string) {
  const api = useApiClient();

  const { data, error, isLoading } = useSWR(
    id ? `/rooms/${id}` : null,
    (url) => api.get<{ id: string; name: string; inviteCode: string; members: Array<{ id: string; userId: string; role: string }> }>(url),
  );

  return {
    room: data,
    isLoading,
    error,
  };
}
