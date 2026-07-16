'use client';

import type { Persona } from '@studymate/shared';
import { cn } from '@/lib/utils';

const personaStyles: Record<Persona, { bg: string; text: string }> = {
  guide: {
    bg: 'bg-brand-500/10',
    text: 'text-brand-600 dark:text-brand-300',
  },
  tutor: {
    bg: 'bg-surface-2',
    text: 'text-foreground',
  },
  partner: {
    bg: 'bg-success/10',
    text: 'text-success dark:text-success',
  },
};

const personaIcons: Record<Persona, string> = {
  guide: '\u2726',
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
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
