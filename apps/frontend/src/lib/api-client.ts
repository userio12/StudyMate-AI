import { useAuth } from '@clerk/nextjs';

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

async function getToken(): Promise<string | null> {
  try {
    const { getToken } = await import('@clerk/nextjs');
    const token = await getToken({ template: 'studymate-ai' });
    return token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

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

  return response.json() as Promise<T>;
}

export function useApiClient() {
  const { getToken } = useAuth();

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: <T>(path: string) =>
      request<T>(path, { method: 'DELETE' }),

    async streamPost(
      path: string,
      body: unknown,
      onToken: (token: string) => void,
      onComplete?: () => void,
      onError?: (error: Error) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      const token = await getToken({ template: 'studymate-ai' });

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

export const apiServer = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
