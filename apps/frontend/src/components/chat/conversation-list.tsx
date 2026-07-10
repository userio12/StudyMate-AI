'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPlus, faThumbtack, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useConversations } from '@/hooks/use-chat';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';
import { useState } from 'react';
import { RenameDialog, ConfirmDeleteDialog, ConfirmPinDialog } from '../ui/action-dialogs';

interface Conversation {
  id: string;
  title: string;
  lastMessageAt?: string | null;
  isPinned?: boolean;
}

export function ConversationList({
  conversations,
  onCreate,
}: {
  conversations: Conversation[];
  onCreate: () => void;
}) {
  const pathname = usePathname();
  const { updateConversation, deleteConversation } = useConversations();

  const [renameItem, setRenameItem] = useState<{ id: string; title: string } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string; title: string } | null>(null);
  const [pinItem, setPinItem] = useState<{ id: string; title: string; isPinned: boolean } | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handlePinConfirm = async () => {
    if (!pinItem) return;
    setIsPending(true);
    try {
      await updateConversation(pinItem.id, { isPinned: !pinItem.isPinned });
      setPinItem(null);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsPending(false);
    }
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameItem) return;
    setIsPending(true);
    try {
      await updateConversation(renameItem.id, { title: newTitle });
      setRenameItem(null);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setIsPending(true);
    try {
      await deleteConversation(deleteItem.id);
      setDeleteItem(null);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={onCreate}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px] text-muted hover:bg-surface-hover hover:text-foreground border border-transparent"
      >
        <FontAwesomeIcon icon={faPlus} className="shrink-0 w-[18px] h-[18px] text-brand-300" />
        New chat
      </button>

      <div className="mt-2 space-y-0.5">
        {conversations.map((conv) => {
          const active = pathname === `/chat/${conv.id}`;
          return (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                'min-h-[44px]',
                active
                  ? 'bg-brand-500/10 text-brand-400 font-medium'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground',
              )}
            >
              <FontAwesomeIcon icon={faCommentDots} className="shrink-0 w-4 h-4" />
              <div className="min-w-0 flex-1">
                <p className="truncate flex items-center gap-2">
                  {conv.isPinned && <FontAwesomeIcon icon={faThumbtack} className="w-3 h-3 text-brand-500" />}
                  {conv.title}
                </p>
                {conv.lastMessageAt && (
                  <p className="text-xs text-muted">
                    {formatRelativeTime(conv.lastMessageAt)}
                  </p>
                )}
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setPinItem({ id: conv.id, title: conv.title, isPinned: !!conv.isPinned });
                  }}
                  className="p-1.5 text-muted hover:text-brand-500 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                  title={conv.isPinned ? "Unpin" : "Pin"}
                >
                  <FontAwesomeIcon icon={faThumbtack} className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setRenameItem({ id: conv.id, title: conv.title });
                  }}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded"
                  title="Rename"
                >
                  <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteItem({ id: conv.id, title: conv.title });
                  }}
                  className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      <RenameDialog
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
        title="Rename Conversation"
        currentName={renameItem?.title ?? ''}
        onConfirm={handleRenameConfirm}
        isPending={isPending}
      />

      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Conversation"
        itemName={deleteItem?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={isPending}
      />

      <ConfirmPinDialog
        open={!!pinItem}
        onOpenChange={(open) => !open && setPinItem(null)}
        title={pinItem?.isPinned ? 'Unpin Conversation' : 'Pin Conversation'}
        itemName={pinItem?.title ?? ''}
        isPinned={!!pinItem?.isPinned}
        onConfirm={handlePinConfirm}
        isPending={isPending}
      />
    </div>
  );
}
