'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Conversation {
  id: string;
  title: string;
  lastMessageAt?: string | null;
}

export function ConversationList({
  conversations,
  onCreate,
}: {
  conversations: Conversation[];
  onCreate: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <button
        onClick={onCreate}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-parchment-200 dark:text-parchment-300 dark:hover:bg-navy-700"
      >
        <Plus size={18} />
        New conversation
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
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                'min-h-[44px]',
                active
                  ? 'bg-terracotta-100 text-terracotta-700 dark:bg-navy-700 dark:text-terracotta-300'
                  : 'text-navy-600 hover:bg-parchment-200 dark:text-parchment-300 dark:hover:bg-navy-700',
              )}
            >
              <MessageSquare size={16} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate">{conv.title}</p>
                {conv.lastMessageAt && (
                  <p className="text-xs text-navy-500 dark:text-parchment-500">
                    {formatRelativeTime(conv.lastMessageAt)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
