'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: { direction: 'up' | 'down'; value: string };
  isLoading?: boolean;
  accentColor?: 'brand' | 'violet' | 'cyan' | 'success';
  className?: string;
}

const accentMap = {
  brand:   { icon: 'text-brand-300',   bg: 'from-brand-500/15 to-brand-600/5',   border: 'group-hover:border-brand-500/30',   iconBg: 'bg-brand-500/15' },
  violet:  { icon: 'text-violet-300',  bg: 'from-violet-500/15 to-violet-600/5', border: 'group-hover:border-violet-500/30', iconBg: 'bg-violet-500/15' },
  cyan:    { icon: 'text-cyan-300',    bg: 'from-cyan-500/15 to-cyan-600/5',     border: 'group-hover:border-cyan-500/30',   iconBg: 'bg-cyan-500/15' },
  success: { icon: 'text-emerald-300', bg: 'from-success/15 to-success/5',       border: 'group-hover:border-success/30',    iconBg: 'bg-success/15' },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof value !== 'number') return;
    const duration = 800;
    const startVal = 0;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (value - startVal) * ease));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export function StatsCard({ label, value, icon, trend, isLoading, accentColor = 'brand', className }: StatsCardProps) {
  const accent = accentMap[accentColor];

  if (isLoading) {
    return (
      <div className={cn("glass-card animate-pulse p-6", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-2.5 w-20 rounded-full shimmer" />
            <div className="h-8 w-12 rounded-lg shimmer" />
          </div>
          <div className="h-10 w-10 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'group glass-card relative overflow-hidden p-6 cursor-default transition-all duration-300 hover:-translate-y-1',
      accent.border,
      className
    )}>
      {/* Subtle gradient tint */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none', accent.bg)} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps text-muted">{label}</p>
          <p className="text-4xl font-extrabold text-foreground leading-none tracking-tight mt-2 mb-2">
            {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
          </p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-semibold mt-1',
              trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400',
            )}>
              {trend.direction === 'up'
                ? <FontAwesomeIcon icon={faArrowTrendUp} className="w-3 h-3" />
                : <FontAwesomeIcon icon={faArrowTrendDown} className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accent.iconBg)}>
          <span className={accent.icon}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
