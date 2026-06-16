'use client';

import type { Persona } from '@studymate/shared';
import { cn } from '@/lib/utils';

const personaStyles: Record<Persona, { bg: string; text: string; ring: string }> = {
  guide: {
    bg: 'bg-terracotta-100 dark:bg-terracotta-900/30',
    text: 'text-terracotta-700 dark:text-terracotta-300',
    ring: 'ring-terracotta-300 dark:ring-terracotta-700',
  },
  tutor: {
    bg: 'bg-navy-100 dark:bg-navy-800',
    text: 'text-navy-600 dark:text-navy-300',
    ring: 'ring-navy-300 dark:ring-navy-600',
  },
  partner: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    ring: 'ring-green-300 dark:ring-green-700',
  },
};

const personaIcons: Record<Persona, string> = {
  guide: '?',
  tutor: '\u25B3',
  partner: '\u2606',
};

export function PersonaBadge({
  persona,
  label,
  description,
  className,
}: {
  persona: Persona;
  label: string;
  description: string;
  className?: string;
}) {
  const style = personaStyles[persona];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        style.bg,
        style.text,
        style.ring,
        className,
      )}
      title={description}
    >
      <span className="text-[10px]" aria-hidden>
        {personaIcons[persona]}
      </span>
      {label}
    </span>
  );
}
