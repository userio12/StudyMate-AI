'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { FileText, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DocumentCardProps {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' },
  processing: { label: 'Processing', className: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
  ready: { label: 'Ready', className: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20' },
  error: { label: 'Error', className: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20' },
} as const;

export function DocumentCard({ id, title, status, createdAt, onDelete }: DocumentCardProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

  return (
    <Link
      href={status === 'ready' ? '/chat' : '#'}
      className={cn(
        'group block transition-transform hover:-translate-y-0.5',
        status !== 'ready' && 'pointer-events-none opacity-60',
      )}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-primary">
              {status === 'processing' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : status === 'error' ? (
                <AlertCircle size={18} />
              ) : (
                <FileText size={18} />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-sans line-clamp-2 leading-tight">
                {title}
              </CardTitle>
              <CardDescription>
                {formatRelativeTime(createdAt)}
              </CardDescription>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(id);
              }}
              className="rounded-none border border-transparent p-1.5 text-muted-foreground opacity-0 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              aria-label={`Delete ${title}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn('px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider', config.className)}>
              {config.label}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
