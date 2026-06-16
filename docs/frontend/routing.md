# Routing

## Route Map

```
/                           Landing page (public, SSR)
├── /features               Features page (public)
├── /privacy                Privacy policy (public)
├── /terms                  Terms of service (public)
│
├── /sign-in                Clerk sign-in (public)
├── /sign-up                Clerk sign-up (public)
│
├── /dashboard              Dashboard overview (protected)
│
├── /documents              Document list (protected)
├── /documents/upload       Upload new document (protected)
├── /documents/[id]         Document detail + quick chat (protected)
│
├── /chat                   Conversation list (protected)
├── /chat/[id]              Chat interface (protected)
│
├── /quiz                   Quiz list (protected)
├── /quiz/[id]              Take quiz (protected)
├── /quiz/[id]/results      Quiz results (protected)
│
├── /rooms                  Room list (protected)
├── /rooms/create           Create room (protected)
├── /rooms/[id]             Room chat (protected)
│
└── /api/webhooks/clerk     Clerk webhook handler (public, POST only)
```

## File Structure

```
app/
├── layout.tsx                         Root layout (ClerkProvider, ThemeProvider, Toaster)
├── page.tsx                           Landing page (redirect to /dashboard if signed in)
├── globals.css                        Design tokens + Tailwind
├── sitemap.ts                         Dynamic sitemap
├── robots.ts                          Robots.txt
├── not-found.tsx                      404 page
├── error.tsx                          Global error boundary
├── loading.tsx                        Global loading state
│
├── (marketing)/                       Route group: no dashboard layout
│   ├── layout.tsx                     Marketing layout (public navbar + footer)
│   ├── page.tsx                       / (landing)
│   ├── features/page.tsx              /features
│   ├── privacy/page.tsx               /privacy
│   └── terms/page.tsx                 /terms
│
├── (auth)/                            Route group: auth pages
│   ├── layout.tsx                     Centered layout
│   ├── sign-in/[[...sign-in]]/page.tsx   /sign-in
│   └── sign-up/[[...sign-up]]/page.tsx   /sign-up
│
└── (dashboard)/                       Route group: protected dashboard
    ├── layout.tsx                     DashboardShell (sidebar + navbar)
    ├── page.tsx                       Redirect to /dashboard
    ├── dashboard/
    │   └── page.tsx                   /dashboard — stats overview
    ├── documents/
    │   ├── page.tsx                   /documents — document list
    │   ├── loading.tsx                Skeleton grid
    │   ├── upload/
    │   │   └── page.tsx               /documents/upload — upload page
    │   └── [id]/
    │       ├── page.tsx               /documents/:id — document detail
    │       └── loading.tsx
    ├── chat/
    │   ├── page.tsx                   /chat — conversation list
    │   ├── loading.tsx
    │   └── [id]/
    │       ├── page.tsx               /chat/:id — chat interface
    │       └── loading.tsx
    ├── quiz/
    │   ├── page.tsx                   /quiz — quiz list
    │   ├── loading.tsx
    │   └── [id]/
    │       ├── page.tsx               /quiz/:id — take quiz
    │       ├── results/page.tsx       /quiz/:id/results — quiz results
    │       └── loading.tsx
    └── rooms/
        ├── page.tsx                   /rooms — room list
        ├── create/page.tsx            /rooms/create — create room
        ├── loading.tsx
        └── [id]/
            ├── page.tsx               /rooms/:id — room chat
            └── loading.tsx
```

## Route Group Layouts

### Marketing Layout (Public)

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/features">Features</Link>
            <Link href="/sign-in">Sign In</Link>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Dashboard Layout (Protected)

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </DashboardShell>
  );
}
```

## Middleware (Route Protection)

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  // Custom protection logic can go here
  // e.g., redirect to onboarding for new users
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
```

## Navigation

```typescript
// components/layout/sidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Brain,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/rooms', label: 'Study Rooms', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card hidden md:flex flex-col">
      <div className="p-6">
        <Logo />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

## Active Link Detection

```typescript
// lib/utils.ts
export function isActiveRoute(
  pathname: string,
  href: string,
  options?: { exact?: boolean },
): boolean {
  if (options?.exact) {
    return pathname === href;
  }

  // For /dashboard, match exactly (so /documents doesn't match /d)
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  // For other routes, check prefix
  return pathname.startsWith(href);
}
```

## Search Parameters

```typescript
// Usage for pagination, filtering
// app/(dashboard)/documents/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function DocumentFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') ?? 'all';
  const page = parseInt(searchParams.get('page') ?? '1');

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/documents?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={status === 'all' ? 'default' : 'outline'}
        onClick={() => setFilter('status', 'all')}
      >
        All
      </Button>
      <Button
        variant={status === 'ready' ? 'default' : 'outline'}
        onClick={() => setFilter('status', 'ready')}
      >
        Ready
      </Button>
      <Button
        variant={status === 'processing' ? 'default' : 'outline'}
        onClick={() => setFilter('status', 'processing')}
      >
        Processing
      </Button>
    </div>
  );
}
```
