'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface CitationBadgeProps {
  number: number;
  title: string;
  snippet: string;
}

export function CitationBadge({ number, title, snippet }: CitationBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex min-h-7 min-w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
          'bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200 dark:bg-navy-700 dark:text-terracotta-300',
        )}
        aria-label={`Citation ${number}: ${title}`}
      >
        {number}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border border-parchment-300 bg-white p-3 shadow-warm-lg dark:border-navy-700 dark:bg-navy-800">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-navy-800 dark:text-parchment-100">
              {title}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 text-navy-400 hover:text-navy-600"
              aria-label="Close citation"
            >
              <ExternalLink size={12} />
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-navy-600 dark:text-parchment-400">
            &ldquo;{snippet}&rdquo;
          </p>
        </div>
      )}
    </span>
  );
}
