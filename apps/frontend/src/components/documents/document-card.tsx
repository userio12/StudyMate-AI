'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircleCheck, faCircleExclamation, faTrashCan, faThumbTack, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '../ui/badge';
import { useApiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RenameDialog, ConfirmDeleteDialog, ConfirmPinDialog } from '../ui/action-dialogs';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';

interface DocumentCardProps {
  id: string;
  title: string;
  status: string;
  progress?: number;
  isPinned?: boolean;
  createdAt: string;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: { title?: string; isPinned?: boolean }) => void;
}

const statusConfig = {
  pending: {
    badge: 'pending' as const,
    label: 'Pending',
    icon: faSpinner,
    iconClass: 'text-amber-300',
    spin: false,
  },
  processing: {
    badge: 'processing' as const,
    label: 'Processing',
    icon: faSpinner,
    iconClass: 'text-brand-300',
    spin: true,
  },
  ready: {
    badge: 'ready' as const,
    label: 'Ready',
    icon: faCircleCheck,
    iconClass: 'text-emerald-300',
    spin: false,
  },
  error: {
    badge: 'error' as const,
    label: 'Error',
    icon: faCircleExclamation,
    iconClass: 'text-red-300',
    spin: false,
  },
} as const;

export function DocumentCard({ id, title, status, progress, isPinned, createdAt, onDelete, onUpdate }: DocumentCardProps) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
  const Icon = cfg.icon;
  const isReady = status === 'ready';
  const isProcessing = status === 'processing';
  const api = useApiClient();
  const router = useRouter();

  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCardClick = async (e: React.MouseEvent) => {
    if (!isReady) return;
    e.preventDefault();
    try {
      const { id: chatId } = await api.post<{ id: string }>('/chat/conversations', {
        title: `Chat: ${title}`,
      });
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
      router.push('/chat');
    }
  };

  return (
    <div className={cn('group relative', !isReady && 'opacity-75')}>
      <div
        onClick={handleCardClick}
        className={cn('block outline-none', isReady ? 'cursor-pointer' : 'cursor-default')}
        tabIndex={isReady ? 0 : -1}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick(e as any);
          }
        }}
      >
        <div className={cn(
          'glass-card relative overflow-hidden px-5 py-4 transition-all duration-300',
          isReady && 'hover:bg-surface-2 hover:border-border-bright hover:shadow-md',
        )}>
          {/* Progress Bar */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 h-1 w-full bg-surface-3">
              <div 
                className="h-full bg-brand-500 transition-all duration-500 ease-out" 
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
          )}

          <div className="relative flex items-center justify-between gap-4">
            {/* File icon */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                isReady ? 'bg-brand-500/10 group-hover:bg-brand-500/20' : isProcessing ? 'bg-brand-500/10' : 'bg-surface-2',
              )}>
                <FontAwesomeIcon
                  icon={Icon}
                  className={cn("w-4 h-4", cfg.iconClass, cfg.spin && 'animate-spin')}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  {isPinned && (
                    <FontAwesomeIcon icon={faThumbTack} className="w-3 h-3 text-brand-400 -rotate-45" />
                  )}
                  <p className="text-base font-bold text-foreground truncate leading-tight group-hover:text-brand-300 transition-colors">
                    {title}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-xs text-muted">{formatRelativeTime(createdAt)}</p>
                  <Badge variant={cfg.badge} className="px-2 py-0.5 text-[10px]">
                  {isProcessing && (
                    <span className="text-brand-300 font-medium mr-1">{progress ?? 0}%</span>
                  )}
                  {cfg.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
              {/* Pin button */}
              {onUpdate && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPin(true);
                  }}
                  className={cn(
                    "shrink-0 rounded-lg p-2 transition-all duration-200",
                    isPinned ? "text-brand-400 hover:bg-brand-500/10" : "text-slate-500 hover:bg-surface-3 hover:text-brand-300"
                  )}
                  aria-label={isPinned ? `Unpin ${title}` : `Pin ${title}`}
                >
                  <FontAwesomeIcon icon={faThumbTack} className="w-[14px] h-[14px]" />
                </button>
              )}

              {/* Rename button */}
              {onUpdate && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRename(true);
                  }}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-surface-3 hover:text-brand-300"
                  aria-label={`Rename ${title}`}
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-[14px] h-[14px]" />
                </button>
              )}

              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDelete(true);
                  }}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-error-dim hover:text-red-400"
                  aria-label={`Delete ${title}`}
                >
                  <FontAwesomeIcon icon={faTrashCan} className="w-[14px] h-[14px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <RenameDialog
        open={showRename}
        onOpenChange={setShowRename}
        title="Rename Document"
        currentName={title}
        onConfirm={async (newTitle) => {
          if (!onUpdate) return;
          setIsPending(true);
          try {
            await onUpdate(id, { title: newTitle });
            setShowRename(false);
            setIsPending(false);
          } catch (err) {
            toast.error(handleApiError(err));
            setIsPending(false);
          }
        }}
        isPending={isPending}
      />

      <ConfirmDeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Document"
        itemName={title}
        onConfirm={async () => {
          if (!onDelete) return;
          setIsPending(true);
          try {
            await onDelete(id);
            setShowDelete(false);
            setIsPending(false);
          } catch (err) {
            toast.error(handleApiError(err));
            setIsPending(false);
          }
        }}
        isPending={isPending}
      />

      <ConfirmPinDialog
        open={showPin}
        onOpenChange={setShowPin}
        title={isPinned ? 'Unpin Document' : 'Pin Document'}
        itemName={title}
        isPinned={!!isPinned}
        onConfirm={async () => {
          if (!onUpdate) return;
          setIsPending(true);
          try {
            await onUpdate(id, { isPinned: !isPinned });
            setShowPin(false);
            setIsPending(false);
          } catch (err) {
            toast.error(handleApiError(err));
            setIsPending(false);
          }
        }}
        isPending={isPending}
      />
    </div>
  );
}
