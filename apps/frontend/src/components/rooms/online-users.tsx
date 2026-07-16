'use client';

import { cn } from '@/lib/utils';

interface OnlineUsersProps {
  users: Array<{ id: string; name?: string | null; avatarUrl?: string | null }>;
  maxVisible?: number;
}

export function OnlineUsers({ users, maxVisible = 5 }: OnlineUsersProps) {
  const visible = users.slice(0, maxVisible);
  const remaining = users.length - visible.length;

  if (users.length === 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        No one online
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((user) => (
          <div
            key={user.id}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-space-900 brand-gradient text-xs font-bold text-white"
            title={user.name ?? 'Anonymous'}
          >
            {user.name?.charAt(0).toUpperCase() ?? '?'}
            {/* Pulsing online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-space-900 pulse-ring" />
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <span className="text-xs font-medium text-slate-500">+{remaining} more</span>
      )}

      <span className="text-xs text-slate-600">online</span>
    </div>
  );
}
