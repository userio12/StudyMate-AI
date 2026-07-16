'use client';

import { cn } from '@/lib/utils';
import { SkeletonRow } from '../ui/skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faFileLines, faGraduationCap, faBookOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Activity {
  id: string;
  type: 'message' | 'document' | 'quiz' | 'room';
  description: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

const activityConfig = {
  message:  { icon: faCommentDots,  color: 'text-brand-300',   bg: 'bg-brand-500/10',   dot: 'bg-brand-400' },
  document: { icon: faFileLines,       color: 'text-cyan-300',    bg: 'bg-cyan-500/10',    dot: 'bg-cyan-400' },
  quiz:     { icon: faGraduationCap,  color: 'text-violet-300',  bg: 'bg-violet-500/10',  dot: 'bg-violet-400' },
  room:     { icon: faBookOpen,       color: 'text-emerald-300', bg: 'bg-success/10',     dot: 'bg-success' },
} as const;

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-brand-500 animate-spin" />
        <span className="text-sm font-medium text-muted tracking-wide animate-pulse">Loading activity...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
          <FontAwesomeIcon icon={faCommentDots} className="text-slate-600 w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-slate-400">No activity yet</p>
        <p className="mt-1 text-xs text-slate-600">Start chatting or upload a document</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      {/* Connector line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-border via-border to-transparent" />

      {activities.map((activity, i) => {
        const cfg = activityConfig[activity.type] ?? activityConfig.message;
        const Icon = cfg.icon;
        return (
          <div key={activity.id} className="group relative flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2 transition-colors duration-150">
            {/* Icon dot */}
            <div className={cn('relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
              <FontAwesomeIcon icon={Icon} className={cn(cfg.color, "w-3.5 h-3.5")} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-slate-300 truncate">{activity.description}</p>
              <p className="mt-0.5 text-xs text-slate-600">{activity.createdAt}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
