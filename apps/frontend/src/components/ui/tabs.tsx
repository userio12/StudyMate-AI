'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

export function Tabs({
  value,
  onValueChange,
  className,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'glass inline-flex items-center gap-1 rounded-lg p-1',
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: selected, onValueChange } = useTabs();
  const active = selected === value;

  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => onValueChange(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-brand-500/10 text-brand-600 shadow-sm dark:text-brand-300'
          : 'text-muted hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: selected } = useTabs();
  if (selected !== value) return null;

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
