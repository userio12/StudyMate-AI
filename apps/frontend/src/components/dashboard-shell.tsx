'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}

function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-parchment-300 bg-parchment-50 transition-transform duration-200 dark:border-navy-700 dark:bg-navy-800',
        !sidebarOpen && '-translate-x-full',
        className,
      )}
    >
      {children}
    </aside>
  );
}

function Navbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        'flex h-14 items-center gap-4 border-b border-parchment-300 bg-parchment-50/80 px-6 backdrop-blur-sm dark:border-navy-700 dark:bg-navy-900/80',
        className,
      )}
    >
      {children}
    </header>
  );
}

function Content({ children, className }: { children: ReactNode; className?: string }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div
      className={cn(
        'flex flex-1 flex-col transition-all duration-200',
        sidebarOpen && 'lg:ml-64',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Main({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn('flex-1 p-6', className)}>
      {children}
    </main>
  );
}

DashboardShell.Sidebar = Sidebar;
DashboardShell.Navbar = Navbar;
DashboardShell.Content = Content;
DashboardShell.Main = Main;

export { DashboardShell };
