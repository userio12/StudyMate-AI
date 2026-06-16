'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, isActiveRoute } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { Files, MessageSquare, GraduationCap, Users, LayoutDashboard, X } from 'lucide-react';
import { DashboardShell } from './dashboard-shell';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/quiz', label: 'Quiz', icon: GraduationCap },
  { href: '/rooms', label: 'Study Rooms', icon: Users },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <DashboardShell.Sidebar>
      <div className="flex h-14 items-center justify-between border-b border-parchment-300 px-4 dark:border-navy-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="studymate-glow h-6 w-6 rounded-full" />
          <span className="font-heading text-lg font-semibold text-navy-800 dark:text-parchment-100">
            StudyMate
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-2 text-navy-500 hover:bg-parchment-200 dark:text-parchment-400 dark:hover:bg-navy-700 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'min-h-[44px]',
                active
                  ? 'bg-terracotta-100 text-terracotta-700 dark:bg-navy-700 dark:text-terracotta-300'
                  : 'text-navy-600 hover:bg-parchment-200 dark:text-parchment-300 dark:hover:bg-navy-700',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon size={20} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </DashboardShell.Sidebar>
  );
}
