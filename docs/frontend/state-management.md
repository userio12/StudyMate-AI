# State Management

## Strategy

| State Type | Tool | Examples |
|---|---|---|
| **Server state** | SWR | Document list, conversation list, quiz data, analytics |
| **Client state** | Zustand | UI preferences, sidebar state, streaming chat buffer |
| **Auth state** | Clerk (`useAuth`, `useUser`) | User profile, session token |
| **Form state** | React Hook Form | Upload form, room creation, quiz answers |
| **URL state** | Next.js `useParams`, `useSearchParams` | Current route, pagination, filters |

## SWR (Server State)

```typescript
// hooks/use-documents.ts
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';

export function useDocuments(page = 1) {
  const { get } = useApiClient();

  return useSWR(
    `/documents?page=${page}&limit=20`,
    (url) => get<PaginatedResponse<Document>>(url),
    {
      revalidateOnFocus: false,       // Don't refetch on tab switch
      revalidateOnReconnect: true,    // Refetch on network recovery
      refreshInterval: 30000,         // Poll every 30s for status changes
      keepPreviousData: true,         // Keep old data while fetching next page
      dedupingInterval: 2000,         // Dedupe requests within 2s
    },
  );
}

// Usage in Server Component:
export default async function DocumentsPage() {
  const initialData = await apiServer('/documents?page=1&limit=20');
  return <DocumentsClient initialData={initialData} />;
}

// Usage in Client Component:
'use client';
export function DocumentsClient({ initialData }) {
  const { data, error, isLoading, mutate } = useDocuments(1);
  const documents = data ?? initialData; // SWR fallback

  if (error) return <ErrorState onRetry={() => mutate()} />;
  if (!documents) return <LoadingState />;

  return <DocumentList documents={documents.data} />;
}
```

### SWR Configuration

```typescript
// lib/swr-provider.tsx
'use client';

import { SWRConfig } from 'swr';

export function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher: async (url) => {
          const { get } = useApiClient();
          return get(url);
        },
        onError: (error) => {
          toast.error(error.message);
          console.error('SWR Error:', error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

## Zustand (Client State)

### Chat Store

The streaming chat state is the most complex client state in the app:

```typescript
// store/chat-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  // Active conversations (from sidebar)
  conversations: Conversation[];
  setConversations: (convs: Conversation[]) => void;

  // Active streaming state
  activeStreams: Map<string, AbortController>;
  streamingMessages: Map<string, {
    content: string;
    citations: Citation[];
  }>;

  // Actions
  startStream: (conversationId: string, controller: AbortController) => void;
  updateStream: (conversationId: string, token: string) => void;
  addCitation: (conversationId: string, citation: Citation) => void;
  endStream: (conversationId: string) => void;
  abortStream: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeStreams: new Map(),
  streamingMessages: new Map(),

  setConversations: (conversations) => set({ conversations }),

  startStream: (conversationId, controller) =>
    set(state => {
      const streams = new Map(state.activeStreams);
      streams.set(conversationId, controller);

      const messages = new Map(state.streamingMessages);
      messages.set(conversationId, { content: '', citations: [] });

      return { activeStreams: streams, streamingMessages: messages };
    }),

  updateStream: (conversationId, token) =>
    set(state => {
      const messages = new Map(state.streamingMessages);
      const existing = messages.get(conversationId) || { content: '', citations: [] };
      messages.set(conversationId, {
        ...existing,
        content: existing.content + token,
      });
      return { streamingMessages: messages };
    }),

  addCitation: (conversationId, citation) =>
    set(state => {
      const messages = new Map(state.streamingMessages);
      const existing = messages.get(conversationId) || { content: '', citations: [] };
      messages.set(conversationId, {
        ...existing,
        citations: [...existing.citations, citation],
      });
      return { streamingMessages: messages };
    }),

  endStream: (conversationId) =>
    set(state => {
      const streams = new Map(state.activeStreams);
      streams.delete(conversationId);

      const messages = new Map(state.streamingMessages);
      messages.delete(conversationId);

      return { activeStreams: streams, streamingMessages: messages };
    }),

  abortStream: (conversationId) => {
    const { activeStreams, endStream } = get();
    activeStreams.get(conversationId)?.abort();
    endStream(conversationId);
  },
}));
```

### UI Store

```typescript
// store/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  selectedDocumentIds: string[];    // For chat RAG scoping

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSelectedDocuments: (ids: string[]) => void;
  addSelectedDocument: (id: string) => void;
  removeSelectedDocument: (id: string) => void;
  clearSelectedDocuments: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      selectedDocumentIds: [],

      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),

      setSelectedDocuments: (ids) => set({ selectedDocumentIds: ids }),
      addSelectedDocument: (id) =>
        set(s => ({
          selectedDocumentIds: [...new Set([...s.selectedDocumentIds, id])],
        })),
      removeSelectedDocument: (id) =>
        set(s => ({
          selectedDocumentIds: s.selectedDocumentIds.filter(d => d !== id),
        })),
      clearSelectedDocuments: () => set({ selectedDocumentIds: [] }),
    }),
    {
      name: 'studymate-ui',
      partialize: (state) => ({
        theme: state.theme,
        selectedDocumentIds: state.selectedDocumentIds,
      }),
    },
  ),
);
```

## Data Flow Summary

```
User Action              State Update               Revalidation
───────────              ────────────               ───────────
Deletes document         mutate(`/documents`)        Refetch list
                          Optimistic update
                          Rollback on error

Uploads PDF              mutate(`/documents`)        Poll status endpoint
                                                     every 2s until 'ready'

Sends chat message       ChatStore.startStream()     SSE stream
                          ChatStore.updateStream()    No revalidation

Generates quiz           mutate(`/quiz/list`)        Refetch quiz list

Submits quiz             mutate(`/quiz/attempts`)    Refetch history
                          mutate(`/quiz/${id}`)       Refetch quiz detail

Joins room               mutate(`/rooms`)            Refetch room list
```
