'use client';

import { UserButton } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useUiStore } from '@/store/ui-store';
import { DashboardNavbar } from './dashboard-shell';
import { cn } from '@/lib/utils';

export function Navbar({ className }: { className?: string }) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <DashboardNavbar className={cn('lg:hidden', className)}>
      <button type="button"
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-foreground transition-colors min-h-11 min-w-11 flex items-center justify-center"
        aria-label="Toggle sidebar"
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <UserButton />
      </div>
    </DashboardNavbar>
  );
}
