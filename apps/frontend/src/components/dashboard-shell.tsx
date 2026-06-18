'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {children}
    </div>
  );
}

export function DashboardSidebar({ children, className }: { children: ReactNode; className?: string }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface',
        mounted && 'transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        !sidebarOpen && '-translate-x-full',
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function DashboardNavbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        'flex h-14 items-center gap-4 border-b border-border bg-surface/90 px-6 backdrop-blur-md',
        className,
      )}
    >
      {children}
    </header>
  );
}

export function DashboardContent({ children, className }: { children: ReactNode; className?: string }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        'flex flex-1 flex-col',
        mounted && 'transition-[margin] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardMain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn('flex-1 p-8', className)}>
      {children}
    </main>
  );
}
