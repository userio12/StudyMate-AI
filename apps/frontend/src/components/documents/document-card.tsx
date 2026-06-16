'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { FileText, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DocumentCardProps {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' },
  processing: { label: 'Processing', className: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
  ready: { label: 'Ready', className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' },
  error: { label: 'Error', className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' },
} as const;

export function DocumentCard({ id, title, status, createdAt, onDelete }: DocumentCardProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

  return (
    <Link
      href={status === 'ready' ? '/chat' : '#'}
      className={cn(
        'group block rounded-xl border border-parchment-300 bg-parchment-50 p-4 transition-all hover:shadow-warm dark:border-navy-700 dark:bg-navy-800',
        status !== 'ready' && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-terracotta-100 p-2 text-terracotta-600 dark:bg-navy-700 dark:text-terracotta-400">
            {status === 'processing' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : status === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <FileText size={20} />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-navy-800 dark:text-parchment-100">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-navy-500 dark:text-parchment-400">
              {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(id);
            }}
            className="rounded-lg p-1.5 text-navy-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20"
            aria-label={`Delete ${title}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.className)}>
          {config.label}
        </span>
      </div>
    </Link>
  );
}
