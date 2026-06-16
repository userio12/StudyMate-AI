'use client';

import { cn } from '@/lib/utils';

interface OnlineUsersProps {
  users: Array<{ id: string; name?: string | null; avatarUrl?: string | null }>;
  maxVisible?: number;
}

export function OnlineUsers({ users, maxVisible = 5 }: OnlineUsersProps) {
  const visible = users.slice(0, maxVisible);
  const remaining = users.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((user, i) => (
          <div
            key={user.id}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 border-parchment-50 text-xs font-medium dark:border-navy-800',
              'bg-terracotta-100 text-terracotta-700 dark:bg-navy-700 dark:text-terracotta-300',
            )}
            title={user.name ?? 'Anonymous'}
          >
            {user.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <span className="ml-2 text-xs text-navy-500 dark:text-parchment-400">
          +{remaining}
        </span>
      )}

      {users.length === 0 && (
        <span className="text-xs text-navy-500 dark:text-parchment-400">
          No one online
        </span>
      )}
    </div>
  );
}
