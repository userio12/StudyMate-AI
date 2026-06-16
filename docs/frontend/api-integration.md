# API Integration

## API Client

### Server-Side Client

```typescript
// lib/api-client.ts
import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: any,
  ) {
    super(`API Error ${status}: ${JSON.stringify(body)}`);
    this.name = 'ApiError';
  }
}

/**
 * Server-side API client for use in Server Components and Route Handlers.
 * Gets the Clerk token from the request context.
 */
export async function apiServer<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { getToken } = auth();
  const token = await getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorBody);
  }

  const json = await response.json();
  return json.data as T;
}
```

### Client-Side Client

```typescript
// lib/api-client.ts (continued)
import { useAuth } from '@clerk/nextjs';

/**
 * Client-side API client for use in Client Components.
 * Gets the Clerk token from the client-side auth context.
 */
export function useApiClient() {
  const { getToken, isSignedIn } = useAuth();

  async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorBody);
    }

    const json = await response.json();
    return json.data as T;
  }

  return {
    get: <T>(path: string) => apiRequest<T>(path),

    post: <T>(path: string, body?: unknown) =>
      apiRequest<T>(path, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    put: <T>(path: string, body?: unknown) =>
      apiRequest<T>(path, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: <T>(path: string) =>
      apiRequest<T>(path, { method: 'DELETE' }),

    /**
     * SSE streaming endpoint — returns raw fetch Response for stream consumption.
     */
    streamPost: (path: string, body: unknown): Promise<Response> => {
      return new Promise(async (resolve, reject) => {
        try {
          const token = await getToken();
          const response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            reject(new ApiError(response.status, errorBody));
            return;
          }

          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
}
```

## Typed Hooks

Each domain has a dedicated hook that wraps the API client with proper types:

```typescript
// hooks/use-chat.ts
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';
import { useChatStore } from '@/store/chat-store';

export function useChat(conversationId?: string) {
  const { get, post, streamPost } = useApiClient();
  const store = useChatStore();

  // Fetch conversation list
  const conversations = useSWR('/chat/conversations',
    (url) => get<Conversation[]>(url),
  );

  // Fetch single conversation with messages
  const conversation = useSWR(
    conversationId ? `/chat/conversations/${conversationId}` : null,
    (url) => get<ConversationDetail>(url),
  );

  // Send a message (SSE streaming)
  const sendMessage = async (
    content: string,
    documentIds: string[],
  ) => {
    if (!conversationId) return;

    // Optimistically add user message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    // mutate local state...

    // Start streaming
    const response = await streamPost('/chat/message', {
      conversationId,
      content,
      documentIds,
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    store.startStream(conversationId, new AbortController());

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
        const event = JSON.parse(line.slice(6));

        switch (event.type) {
          case 'token':
            store.updateStream(conversationId, event.data);
            break;
          case 'citation':
            store.addCitation(conversationId, event.data);
            break;
          case 'done':
            store.endStream(conversationId);
            // Revalidate conversation to get persisted messages
            conversation.mutate();
            break;
        }
      }
    }
  };

  const createConversation = async (title?: string, documentId?: string) => {
    const result = await post<Conversation>('/chat/conversations', {
      title,
      documentId,
    });
    conversations.mutate(); // Refresh list
    return result;
  };

  const deleteConversation = async (id: string) => {
    await get(`/chat/conversations/${id}`, { method: 'DELETE' });
    conversations.mutate();
  };

  return {
    conversations: conversations.data ?? [],
    isLoading: conversations.isLoading,
    error: conversations.error,

    conversation: conversation.data,
    isConversationLoading: conversation.isLoading,

    sendMessage,
    createConversation,
    deleteConversation,

    // Streaming state
    streamingContent: conversationId
      ? store.streamingMessages.get(conversationId)?.content
      : undefined,
    streamingCitations: conversationId
      ? store.streamingMessages.get(conversationId)?.citations
      : undefined,
    isStreaming: conversationId
      ? store.activeStreams.has(conversationId)
      : false,
    abortStream: () => conversationId && store.abortStream(conversationId),
  };
}
```

## Error Handling

```typescript
// lib/error-handler.ts
import { ApiError } from './api-client';

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.body.message || 'Invalid input. Please check your data.';
      case 401:
        return 'Session expired. Please sign in again.';
      case 403:
        return "You don't have permission to access this resource.";
      case 404:
        return 'Resource not found.';
      case 409:
        return 'This action conflicts with the current state.';
      case 413:
        return 'File is too large. Maximum size is 50MB.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Something went wrong. Please try again.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error. Please check your connection.';
  }

  return 'An unexpected error occurred.';
}
```

## Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error boundary caught:', error, info);
    // Send to Sentry
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm max-w-md text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```
