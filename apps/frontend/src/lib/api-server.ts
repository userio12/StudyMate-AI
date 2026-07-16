import { auth } from '@clerk/nextjs/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function apiServer<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Server fetch failed: ${response.status} ${errorBody.message ?? ''}`);
  }

  const json = await response.json();
  return (json.data !== undefined ? json.data : json) as T;
}
