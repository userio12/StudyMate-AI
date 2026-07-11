'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, isActiveRoute } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faCommentDots, faGraduationCap, faUsers, faTableColumns, faXmark, faWandMagicSparkles, faGear } from '@fortawesome/free-solid-svg-icons';
import { DashboardSidebar } from './dashboard-shell';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { href: '/dashboard', label: 'Overview',      icon: faTableColumns },
  { href: '/documents', label: 'Documents',     icon: faFileLines },
  { href: '/chat',      label: 'Chat',          icon: faCommentDots },
  { href: '/quiz',      label: 'Quiz',          icon: faGraduationCap },
  { href: '/rooms',     label: 'Study Rooms',   icon: faUsers },
  { href: '/settings',  label: 'Settings',      icon: faGear },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  
  if (pathname.startsWith('/chat')) {
    return null;
  }

  return (
    <DashboardSidebar>
      {/* ── Logo ─── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-5">
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-lg brand-gradient flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">StudyMate</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground lg:hidden transition-colors"
          aria-label="Close sidebar"
        >
          <FontAwesomeIcon icon={faXmark} className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* ── Nav items ─── */}
      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-8" aria-label="Main navigation">
        <div className="space-y-1">
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 min-h-[36px]',
                active
                  ? 'nav-active'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground border border-transparent',
              )}
            >
              <FontAwesomeIcon
                icon={item.icon}
                aria-hidden="true"
                className={cn(
                  'shrink-0 w-[18px] h-[18px] transition-colors',
                  active ? 'text-brand-300' : 'text-muted group-hover:text-foreground',
                )}
              />
              {item.label}
            </Link>
          );
        })}
        </div>
      </nav>

      {/* ── Bottom strip ─── */}
      <div className="border-t border-border/50 p-4 space-y-4 bg-surface-1/50">
        {/* AI badge */}
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 border border-border/50 px-3 py-2">
          <FontAwesomeIcon icon={faWandMagicSparkles} className="text-brand-400 w-3.5 h-3.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Google Gemini</p>
            <p className="text-[10px] text-muted">Intelligence engine</p>
          </div>
        </div>
        {/* User */}
        <div className="flex items-center gap-2.5 px-1">
          <UserButton />
          <p className="text-xs text-muted truncate">Your account</p>
        </div>
      </div>
    </DashboardSidebar>
  );
}
