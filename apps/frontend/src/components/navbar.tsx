'use client';

import { UserButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useUiStore } from '@/store/ui-store';
import { DashboardShell } from './dashboard-shell';

export function Navbar({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  useEffect(() => setMounted(true), []);

  return (
    <DashboardShell.Navbar className={className}>
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-navy-500 hover:bg-parchment-200 dark:text-parchment-400 dark:hover:bg-navy-700 min-h-11 min-w-11 flex items-center justify-center"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-navy-500 hover:bg-parchment-200 dark:text-parchment-400 dark:hover:bg-navy-700 min-h-11 min-w-11 flex items-center justify-center"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <UserButton />
      </div>
    </DashboardShell.Navbar>
  );
}
