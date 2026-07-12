'use client';

import { DifficultyBadge } from './difficulty-badge';
import { formatRelativeTime, pluralize, cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faArrowRight, faClock, faThumbTack, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RenameDialog, ConfirmDeleteDialog, ConfirmPinDialog } from '../ui/action-dialogs';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';

interface QuizCardProps {
  id: string;
  title: string;
  difficulty: string;
  questionCount: number;
  isPinned?: boolean;
  createdAt: string;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: { title?: string; isPinned?: boolean }) => void;
}

export function QuizCard({ id, title, difficulty, questionCount, isPinned, createdAt, onDelete, onUpdate }: QuizCardProps) {
  const router = useRouter();
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/quiz/${id}`);
  };

  return (
    <div className="group relative">
      <div
        onClick={handleCardClick}
        className="block outline-none cursor-pointer"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick(e as any);
          }
        }}
      >
        <div className="glass-card flex flex-col p-4 hover:border-border-bright hover:bg-surface-2 transition-all duration-300 relative overflow-hidden h-full">
          
          <div className="flex items-start justify-between gap-3 flex-1">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 group-hover:bg-violet-500/15 transition-colors">
                <FontAwesomeIcon icon={faGraduationCap} className="text-violet-300 w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isPinned && (
                    <FontAwesomeIcon icon={faThumbTack} className="w-3 h-3 text-violet-400 -rotate-45" />
                  )}
                  <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors leading-snug">
                    {title}
                  </h3>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  <span>{questionCount} {pluralize(questionCount, 'question')}</span>
                  <span>·</span>
                  <FontAwesomeIcon icon={faClock} className="w-[11px] h-[11px]" />
                  <span>{formatRelativeTime(createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
              {onUpdate && (
                <button aria-label="Action" type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPin(true);
                  }}
                  className={cn(
                    "shrink-0 rounded-lg p-2 transition-all duration-200",
                    isPinned ? "text-violet-400 hover:bg-violet-500/10" : "text-slate-500 hover:bg-surface-3 hover:text-violet-300"
                  )}
                >
                  <FontAwesomeIcon icon={faThumbTack} className="w-[14px] h-[14px]" />
                </button>
              )}
              {onUpdate && (
                <button aria-label="Action" type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRename(true);
                  }}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-surface-3 hover:text-violet-300"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-[14px] h-[14px]" />
                </button>
              )}
              {onDelete && (
                <button aria-label="Action" type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDelete(true);
                  }}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-error-dim hover:text-red-400"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="w-[14px] h-[14px]" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 justify-between">
            <DifficultyBadge difficulty={difficulty} />
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-slate-700 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200 w-4 h-4"
            />
          </div>
        </div>
      </div>

      <RenameDialog
        open={showRename}
        onOpenChange={setShowRename}
        title="Rename Quiz"
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
        title="Delete Quiz"
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
        title={isPinned ? 'Unpin Quiz' : 'Pin Quiz'}
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
