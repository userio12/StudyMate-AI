'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 rounded bg-border" />
          <div className="h-8 w-8 rounded-lg bg-border" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 rounded bg-border" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
          {label}
        </CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <p
            className={cn(
              'mt-1 font-mono text-xs',
              trend.direction === 'up'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
