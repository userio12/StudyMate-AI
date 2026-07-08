'use client';

import { DifficultyBadge } from './difficulty-badge';
import { formatRelativeTime, pluralize } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface QuizCardProps {
  id: string;
  title: string;
  difficulty: string;
  questionCount: number;
  createdAt: string;
}

export function QuizCard({ id, title, difficulty, questionCount, createdAt }: QuizCardProps) {
  return (
    <Link
      href={`/quiz/${id}`}
      className="glass-card group block p-5 hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 group-hover:bg-violet-500/15 transition-colors">
            <FontAwesomeIcon icon={faGraduationCap} className="text-violet-300 w-[18px] h-[18px]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors leading-snug">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span>{questionCount} {pluralize(questionCount, 'question')}</span>
              <span>·</span>
              <FontAwesomeIcon icon={faClock} className="w-[11px] h-[11px]" />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
          </div>
        </div>

        <FontAwesomeIcon
          icon={faArrowRight}
          className="shrink-0 mt-1 text-slate-700 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200 w-4 h-4"
        />
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <DifficultyBadge difficulty={difficulty} />
      </div>
    </Link>
  );
}
