'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { useMounted } from '@/hooks/use-mounted';

/** Root shell — full-height dark flex container with animated mesh background */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground transition-colors duration-200">
      {children}
    </div>
  );
}

/** Fixed 240px sidebar — always visible on desktop (lg+), drawer on mobile */
export function DashboardSidebar({ children, className }: { children: ReactNode; className?: string }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const mounted = useMounted();

  return (
    <>
      {/* Mobile overlay */}
      {mounted && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            role="presentation"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
      )}
      <aside
        className={cn(
          // Always visible on desktop — floating panel with margins
          'fixed left-0 top-0 z-40 flex h-screen w-56 flex-col p-4',
          // Mobile: slide in/out
          'transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
          '-translate-x-full lg:translate-x-0',
          mounted && sidebarOpen && '!translate-x-0',
          className,
        )}
      >
        <div className="flex-1 rounded-2xl bg-surface-1 border border-border/50 shadow-sm flex flex-col overflow-hidden">
          {children}
        </div>
      </aside>
    </>
  );
}

/** Top navigation bar */
export function DashboardNavbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 items-center gap-4 px-4 bg-background/50 backdrop-blur-md border-b border-border/50',
        className,
      )}
    >
      {children}
    </header>
  );
}

/** Main content area — offset by sidebar width on desktop */
export function DashboardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-1 flex-col min-w-0 lg:ml-56', className)}>
      {children}
    </div>
  );
}

/** Page content wrapper with scroll area */
export function DashboardMain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn('flex-1 overflow-auto relative flex flex-col p-4 sm:p-6 md:p-8', className)}>
      {children}
    </main>
  );
}
