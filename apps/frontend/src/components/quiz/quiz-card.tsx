'use client';

import { DifficultyBadge } from './difficulty-badge';
import { formatRelativeTime, pluralize } from '@/lib/utils';
import { GraduationCap, ArrowRight } from 'lucide-react';
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
      className="block rounded-xl border border-parchment-300 bg-parchment-50 p-5 transition-all hover:shadow-warm dark:border-navy-700 dark:bg-navy-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-terracotta-100 p-2 text-terracotta-600 dark:bg-navy-700 dark:text-terracotta-400">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-navy-800 dark:text-parchment-100">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-navy-500 dark:text-parchment-400">
              {questionCount} {pluralize(questionCount, 'question')} &middot; {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>
        <ArrowRight size={16} className="mt-1 text-navy-400 dark:text-parchment-500" />
      </div>

      <div className="mt-3">
        <DifficultyBadge difficulty={difficulty} />
      </div>
    </Link>
  );
}
