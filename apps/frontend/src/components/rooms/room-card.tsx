'use client';

import { formatRelativeTime } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faClock, faTrash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface RoomCardProps {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  isOwner?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
}

// Deterministic gradient per room name
function roomGradient(name: string) {
  const idx = name.charCodeAt(0) % 4;
  const gradients = [
    'from-brand-500 to-violet-500',
    'from-cyan-500 to-brand-500',
    'from-violet-500 to-pink-500',
    'from-emerald-500 to-cyan-500',
  ];
  return gradients[idx] ?? gradients[0];
}

export function RoomCard({ id, name, inviteCode, createdAt, isOwner, onDelete }: RoomCardProps) {
  const grad = roomGradient(name);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/rooms/${id}`}
      className="glass-card group block px-4 py-3 hover:border-border-bright hover:bg-surface-2 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Gradient avatar */}
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${grad} text-white text-[11px] font-bold brand-glow group-hover:scale-105 transition-transform duration-300`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="text-[15px] font-bold text-foreground group-hover:text-cyan-400 transition-colors truncate leading-tight">
              {name}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted">
              <span className="font-mono bg-surface-2 border border-border px-1.5 py-0.5 rounded text-foreground">
                {inviteCode}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="w-[11px] h-[11px]" /> {formatRelativeTime(createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(e);
              }}
              className="relative z-10 shrink-0 text-muted hover:text-red-400 p-2 rounded-full hover:bg-red-400/10 transition-all duration-200"
              aria-label="Delete room"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          )}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="shrink-0 text-muted group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 w-4 h-4"
          />
        </div>
      </div>
    </Link>
  );
}
