import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

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

  // Cache the token promise to avoid redundant calls within the same hook lifecycle or concurrent requests
  const getCachedToken = useMemo(() => {
    let tokenPromise: Promise<string | null> | null = null;
    let lastFetched = 0;
    const CACHE_TTL = 5000; // 5 seconds

    return async () => {
      const now = Date.now();
      if (tokenPromise && now - lastFetched < CACHE_TTL) {
        return tokenPromise;
      }

      lastFetched = now;
      tokenPromise = getToken({ template: 'studymate-ai' }).then(t => t ?? null);
      return tokenPromise;
    };
  }, [getToken]);

  const getWithAuth = async <T>(path: string) => {
    const token = await getCachedToken();
    return request<T>(path, {}, token);
  };

  const postWithAuth = async <T>(path: string, body?: unknown) => {
    const token = await getCachedToken();
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, token);
  };

  const deleteWithAuth = async <T>(path: string) => {
    const token = await getCachedToken();
    return request<T>(path, { method: 'DELETE' }, token);
  };

  return {
    get: getWithAuth,
    post: postWithAuth,
    delete: deleteWithAuth,

    async streamPost(
      path: string,
      body: unknown,
      onToken: (token: string) => void,
      onComplete?: () => void,
      onError?: (error: Error) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      const token = await getCachedToken();

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

      try {
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
              onToken(data);
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
