'use client';

import { formatRelativeTime } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface RoomCardProps {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
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

export function RoomCard({ id, name, inviteCode, createdAt }: RoomCardProps) {
  const grad = roomGradient(name);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/rooms/${id}`}
      className="glass-card group block px-6 py-5 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-surface-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Gradient avatar */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-sm font-bold brand-glow group-hover:scale-105 transition-transform duration-300`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="text-base font-bold text-foreground group-hover:text-cyan-400 transition-colors truncate leading-tight">
              {name}
            </h3>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
              <span className="font-mono bg-surface-2 border border-border px-1.5 py-0.5 rounded text-foreground">
                {inviteCode}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="w-[11px] h-[11px]" /> {formatRelativeTime(createdAt)}
              </span>
            </div>
          </div>
        </div>

        <FontAwesomeIcon
          icon={faArrowRight}
          className="shrink-0 text-muted group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 w-4 h-4"
        />
      </div>
    </Link>
  );
}
