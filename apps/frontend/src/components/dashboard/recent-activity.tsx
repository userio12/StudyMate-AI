'use client';

import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, FileText, GraduationCap } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'message' | 'document' | 'quiz_attempt';
  description: string;
  createdAt: string;
}

const activityIcons = {
  message: MessageSquare,
  document: FileText,
  quiz_attempt: GraduationCap,
} as const;

export function RecentActivity({
  activities,
  isLoading,
}: {
  activities: ActivityItem[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <ul className="animate-pulse space-y-3" aria-label="Loading recent activity">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-none bg-border" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-48 rounded-none bg-border" />
              <div className="h-2.5 w-24 rounded-none bg-border" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center" aria-live="polite">
        <MessageSquare size={24} className="text-muted-foreground" aria-hidden="true" />
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type];
        return (
          <li key={activity.id} className="flex items-start gap-4">
            <div className="mt-0.5 text-primary" aria-hidden="true">
              <Icon size={18} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-sans text-sm font-medium leading-none text-foreground">
                {activity.description}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
