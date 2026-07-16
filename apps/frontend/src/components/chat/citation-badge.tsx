'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface CitationBadgeProps {
  number: number;
  title: string;
  snippet: string;
}

export function CitationBadge({ number, title, snippet }: CitationBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex min-h-7 min-w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-200',
          'bg-brand-500/10 text-brand-600 hover:bg-brand-500 hover:text-white dark:text-brand-300',
        )}
        aria-label={`Citation ${number}: ${title}`}
      >
        {number}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-border/50 bg-surface-1 p-3 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-foreground">
              {title}
            </p>
            <button type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded p-0.5 text-muted hover:bg-surface-2"
              aria-label="Close citation"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-fg">
            &ldquo;{snippet}&rdquo;
          </p>
        </div>
      )}
    </span>
  );
}
