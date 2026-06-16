'use client';

import { cn } from '@/lib/utils';

const difficultyConfig = {
  beginner: { label: 'Beginner', className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' },
  intermediate: { label: 'Intermediate', className: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' },
  advanced: { label: 'Advanced', className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' },
} as const;

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] ?? difficultyConfig.beginner;

  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
