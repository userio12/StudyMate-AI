import { useAuth } from '@clerk/nextjs';
import { useState, useCallback, useMemo, useRef } from 'react';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// FIX BUG-26: Extract the Clerk JWT template name as a shared constant so it
// cannot be accidentally mistyped in different files (previously hardcoded in
// both api-client.ts and use-room-chat.ts independently).
export const CLERK_JWT_TEMPLATE = 'studymate-ai';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store', // Prevent browser caching of API responses
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, body.message ?? 'Request failed');
  }

  const json = await response.json();
  return (json.data !== undefined ? json.data : json) as Promise<T>;
}

export function useApiClient() {
  const { getToken } = useAuth();

  const cachedTokenRef = useRef<string | null>(null);
  const lastFetchedRef = useRef<number>(0);

  // FIX BUG-28: Cache the resolved token value (not the Promise) with a short TTL.
  // The previous implementation cached the Promise which could hold a reference
  // to a token that expired mid-cache-window. By re-fetching on TTL expiry and
  // invalidating on auth errors, we ensure stale tokens are not reused.
  const CACHE_TTL = 4_000; // 4 seconds — well under typical JWT expiry

  const invalidate = () => {
    cachedTokenRef.current = null;
    lastFetchedRef.current = 0;
  };

  const get = async (): Promise<string | null> => {
    const now = Date.now();
    if (cachedTokenRef.current !== null && now - lastFetchedRef.current < CACHE_TTL) {
      return cachedTokenRef.current;
    }
    lastFetchedRef.current = now;
    cachedTokenRef.current = await getToken({ template: CLERK_JWT_TEMPLATE }).then((t) => t ?? null);
    return cachedTokenRef.current;
  };

  const getCachedToken = { get, invalidate };

  const getWithAuth = async <T>(path: string) => {
    const token = await getCachedToken.get();
    try {
      return await request<T>(path, {}, token);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        getCachedToken.invalidate();
      }
      throw err;
    }
  };

  const postWithAuth = async <T>(path: string, body?: unknown) => {
    const token = await getCachedToken.get();
    try {
      return await request<T>(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }, token);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        getCachedToken.invalidate();
      }
      throw err;
    }
  };

  const patchWithAuth = async <T>(path: string, body?: unknown) => {
    const token = await getCachedToken.get();
    try {
      return await request<T>(path, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      }, token);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        getCachedToken.invalidate();
      }
      throw err;
    }
  };

  const deleteWithAuth = async <T>(path: string) => {
    const token = await getCachedToken.get();
    try {
      return await request<T>(path, { method: 'DELETE' }, token);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        getCachedToken.invalidate();
      }
      throw err;
    }
  };

  return {
    get: getWithAuth,
    post: postWithAuth,
    patch: patchWithAuth,
    delete: deleteWithAuth,

    async streamPost(
      path: string,
      body: unknown,
      onToken: (token: string) => void,
      onComplete?: () => void,
      onError?: (error: Error) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      try {
        const token = await getCachedToken.get();

        const response = await fetch(`${BASE_URL}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal,
        });

        if (!response.ok) {
          if (response.status === 401) getCachedToken.invalidate();
          const errBody = await response.json().catch(() => ({ message: 'Stream failed' }));
          onError?.(new ApiError(response.status, errBody.message ?? 'Stream failed'));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          onError?.(new Error('No response body'));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                onComplete?.();
                return;
              }

              if (data.startsWith('[ERROR]')) {
                onError?.(new Error(data.slice(7).trim()));
                return;
              }

              try {
                onToken(JSON.parse(data) as string);
              } catch {
                onToken(data);
              }
            }
          }
        }
        onComplete?.();
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error('Stream error'));
      }
    },
  };
}
