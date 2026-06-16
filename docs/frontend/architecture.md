# Frontend Architecture (Next.js 15 App Router)

## Rendering Strategy

| Page Type | Rendering | Reason |
|---|---|---|
| Landing (`/`) | SSR (Server Component) | SEO, fast LCP, no client JS needed |
| Sign-in / Sign-up | SSR (Server Component) | Clerk handles auth UI via `<SignIn />` |
| Dashboard (`/dashboard`) | RSC with client islands | Fast shell, interactive widgets |
| Documents (`/documents`) | RSC with client components | Server-fetched list, client upload |
| Chat (`/chat/[id]`) | Client Component | Streaming SSE, real-time state |
| Quiz (`/quiz/[id]`) | Client Component | Interactive quiz state |
| Rooms (`/rooms/[id]`) | Client Component | WebSocket connection |

## Layout Hierarchy

```
RootLayout (ClerkProvider + ThemeProvider)
├── MarketingLayout  →  Landing, /features, /privacy
├── AuthLayout       →  /sign-in, /sign-up
└── DashboardLayout (protected)
    ├── Sidebar (navigation)
    ├── Navbar (user menu, breadcrumbs)
    └── Main Content
        ├── DashboardPage (stats)
        ├── DocumentsPage (list)
        ├── ChatPage (interface)
        ├── QuizPage (questions)
        └── RoomsPage (real-time chat)
```

## Server vs Client Component Split

```typescript
// ✅ Server Component (default in App Router)
// /app/(dashboard)/documents/page.tsx
import { apiServer } from '@/lib/api-client';
import { DocumentList } from './document-list';

export default async function DocumentsPage() {
  // Fetch data on server
  const documents = await apiServer('/documents');

  return (
    <div>
      <h1>My Documents</h1>
      {/* Client component with interactivity */}
      <DocumentList initialData={documents} />
    </div>
  );
}

// ✅ Client Component
// /app/(dashboard)/documents/document-list.tsx
'use client';

import { useState } from 'react';
import { DocumentCard } from '@/components/documents/document-card';

export function DocumentList({ initialData }) {
  const [documents, setDocuments] = useState(initialData);

  return (
    <div className="grid gap-4">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
```

## Data Flow Pattern

```
Server Component
  ├── Fetch data via apiServer() (Clerk token from server-side)
  ├── Render shell with initial data
  └── Pass data to Client Components
       │
       ▼
Client Component
  ├── Receive initialData as props
  ├── SWR revalidation (stale-while-revalidate)
  │     └── useSWR('/documents', fetcher, { fallbackData: initialData })
  ├── User actions → API calls via useApiClient()
  └── Optimistic updates via Zustand or SWR mutate
```

## Streaming Architecture (Chat)

```typescript
// hooks/use-streaming-chat.ts
import { useCallback, useRef, useState } from 'react';
import { useApiClient } from '@/lib/api-client';

interface StreamingState {
  content: string;
  citations: Citation[];
  isStreaming: boolean;
}

export function useStreamingChat() {
  const [state, setState] = useState<StreamingState>({
    content: '',
    citations: [],
    isStreaming: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const streamMessage = useCallback(async (
    conversationId: string,
    content: string,
    documentIds: string[],
  ) => {
    // Reset state
    setState({ content: '', citations: [], isStreaming: true });

    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({ conversationId, content, documentIds }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const event = JSON.parse(line.slice(6));

        switch (event.type) {
          case 'token':
            accumulated += event.data;
            setState(prev => ({
              ...prev,
              content: accumulated,
            }));
            break;

          case 'citation':
            setState(prev => ({
              ...prev,
              citations: [...prev.citations, event.data],
            }));
            break;

          case 'done':
            setState(prev => ({
              ...prev,
              isStreaming: false,
            }));
            return { messageId: event.data.messageId, content: accumulated };
        }
      }
    }
  }, []);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return { ...state, streamMessage, abortStream };
}
```

## Theme Architecture

```typescript
// app/providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

CSS variables in `globals.css` handle the actual color switching:

```css
:root {
  --background: 0 0% 100%;
  --primary: 239 84% 67%;
  /* ... */
}

.dark {
  --background: 222 47% 6%;
  --primary: 239 84% 67%;
  /* ... */
}
```

## Route Protection

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/features',
    '/privacy',
    '/terms',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
  ],
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
```

## Suspense & Loading Boundaries

Every data-fetching page must be wrapped in a `<Suspense>` boundary with a `loading.tsx`:

```
app/(dashboard)/
├── documents/
│   ├── page.tsx        ← Suspense boundary wrapping DocumentList
│   ├── loading.tsx     ← Skeleton grid (6 cards)
│   └── [id]/
│       ├── page.tsx    ← Suspense boundary wrapping DocumentDetail
│       └── loading.tsx ← Skeleton detail view
├── chat/
│   ├── page.tsx        ← Suspense boundary wrapping ConversationList
│   ├── loading.tsx     ← Skeleton list items
│   └── [id]/
│       ├── page.tsx    ← No Suspense needed (client-only)
│       └── loading.tsx ← Skeleton chat
├── quiz/
│   ├── page.tsx        ← Suspense boundary wrapping QuizList
│   ├── loading.tsx     ← Skeleton cards
│   └── [id]/
│       ├── page.tsx    ← No Suspense needed (client-only)
│       └── loading.tsx ← Skeleton question + options
└── rooms/
    ├── page.tsx        ← Suspense boundary wrapping RoomList
    ├── loading.tsx     ← Skeleton cards
    └── [id]/
        ├── page.tsx    ← No Suspense needed (Socket.IO client)
        └── loading.tsx ← Skeleton room
```

## Dynamic Import Rules

Heavy client-only libraries must be dynamically imported:

```typescript
// ✅ Correct — lazy loaded
const ChatMessage = dynamic(() => import('@/components/chat/chat-message'), {
  loading: () => <Skeleton className="h-24 w-full" />,
});

const ScoreCircle = dynamic(() => import('@/components/quiz/score-circle'), {
  ssr: false, // SVG animation — server render is useless
});

const WeakTopicsChart = dynamic(() => import('recharts').then(m => m.BarChart), {
  ssr: false,
});
```

**Bundle split budget:**

| Library | When to Lazy Load |
|---|---|
| `react-markdown` + `rehype-highlight` | Chat page only |
| `recharts` | Quiz results + dashboard only |
| `framer-motion` | Already bundled (used everywhere) |
| `react-dropzone` | Documents page only |
| `lucide-react` | Tree-shaken — no lazy load needed |

## Performance Rules (Vercel Engineering)

| Rule | Category | Impact |
|---|---|---|
| All data-dependent components wrapped in `Suspense` | Eliminate waterfalls | Critical |
| Server Components for initial data fetch (no `useEffect` for data) | Eliminate waterfalls | Critical |
| Dynamic import of `react-markdown`, `recharts`, quiz heavy UI | Bundle size | Critical |
| `next/link` with `prefetch={true}` for dashboard navigation | Preloading | High |
| Font loading via `next/font` with `display: swap` | Performance | High |
| No `'use client'` on pages that only fetch + pass data | Server-side perf | High |
| Minimize `useEffect`/`setState` in Server Component trees | Re-render | Medium |
| CSS-only animations over JS (Framer only when necessary) | Rendering | Medium |
| Tabular-nums on data-heavy tables to prevent layout shift | Rendering | Medium |
| `will-change: transform` only on animating elements, never globally | Rendering | Low |

## Performance Optimizations

| Technique | Implementation |
|---|---|
| **Image optimization** | `next/image` with WebP, lazy loading, remote patterns |
| **Font loading** | `next/font` with `display: swap` |
| **Bundle splitting** | Dynamic imports for heavy components (chat, quiz, charts) |
| **Streaming SSR** | `loading.tsx` and `Suspense` boundaries (see table above) |
| **Prefetching** | `<Link prefetch={true}>` for dashboard navigation |
| **CSS** | Tailwind JIT — only includes used classes |
| **Icons** | Lucide is tree-shakeable — only imported icons in bundle |
| **Server components** | Minimize client bundle by keeping data fetching on server |
