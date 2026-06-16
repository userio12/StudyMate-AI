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
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-parchment-300 dark:bg-navy-700" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-48 rounded bg-parchment-300 dark:bg-navy-700" />
              <div className="h-2.5 w-24 rounded bg-parchment-300 dark:bg-navy-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <MessageSquare size={24} className="text-parchment-400" />
        <p className="text-sm text-navy-500 dark:text-parchment-400">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type];
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="rounded-full bg-parchment-200 p-1.5 text-navy-500 dark:bg-navy-700 dark:text-parchment-400">
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-navy-700 dark:text-parchment-200">
                {activity.description}
              </p>
              <p className="text-xs text-navy-500 dark:text-parchment-400">
                {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
