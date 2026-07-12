'use client';

import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-9 w-28 animate-pulse rounded-full bg-white/10" />;
  }

  return (
    <div className="flex items-center rounded-full bg-slate-200/50 p-1 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 backdrop-blur-sm shadow-inner">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'flex h-7 w-9 items-center justify-center rounded-full transition-all duration-200',
          theme === 'light'
            ? 'bg-white text-brand-600 shadow-sm dark:bg-transparent dark:text-ink-400'
            : 'text-slate-500 hover:text-slate-700 dark:text-ink-400 dark:hover:text-cream-100'
        )}
        aria-label="Light mode"
      >
        <FontAwesomeIcon icon={faSun} className="h-[14px] w-[14px]" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'flex h-7 w-9 items-center justify-center rounded-full transition-all duration-200',
          theme === 'system'
            ? 'bg-white text-brand-600 shadow-sm dark:bg-white/10 dark:text-cream-100'
            : 'text-slate-500 hover:text-slate-700 dark:text-ink-400 dark:hover:text-cream-100'
        )}
        aria-label="System mode"
      >
        <FontAwesomeIcon icon={faDesktop} className="h-[13px] w-[13px]" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'flex h-7 w-9 items-center justify-center rounded-full transition-all duration-200',
          theme === 'dark'
            ? 'bg-white text-brand-600 shadow-sm dark:bg-white/10 dark:text-cream-100'
            : 'text-slate-500 hover:text-slate-700 dark:text-ink-400 dark:hover:text-cream-100'
        )}
        aria-label="Dark mode"
      >
        <FontAwesomeIcon icon={faMoon} className="h-[13px] w-[13px]" />
      </button>
    </div>
  );
}
