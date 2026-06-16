'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: { direction: 'up' | 'down'; value: string };
  isLoading?: boolean;
}

export function StatsCard({ label, value, icon, trend, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-parchment-300 bg-parchment-50 p-5 dark:border-navy-700 dark:bg-navy-800">
        <div className="h-10 w-10 rounded-lg bg-parchment-300 dark:bg-navy-700" />
        <div className="mt-3 h-4 w-24 rounded bg-parchment-300 dark:bg-navy-700" />
        <div className="mt-2 h-8 w-16 rounded bg-parchment-300 dark:bg-navy-700" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-parchment-300 bg-parchment-50 p-5 dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-terracotta-100 p-2.5 text-terracotta-600 dark:bg-navy-700 dark:text-terracotta-400">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.direction === 'up'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {trend.direction === 'up' ? '+' : '-'}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-navy-600 dark:text-parchment-400">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold text-navy-800 dark:text-parchment-100">
        {value}
      </p>
    </div>
  );
}
