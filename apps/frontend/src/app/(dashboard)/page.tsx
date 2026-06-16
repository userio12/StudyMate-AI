'use client';

import { useAnalytics } from '@/hooks/use-analytics';
import { StatsCard } from '@/components/dashboard/stats-card';
import { WeakTopicsChart } from '@/components/dashboard/weak-topics-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Files, MessageSquare, GraduationCap } from 'lucide-react';

export default function DashboardPage() {
  const { stats, isLoading } = useAnalytics();

  const activities = (stats?.recentActivity ?? []).map((entry, i) => ({
    id: `activity-${i}`,
    type: 'message' as const,
    description: `${entry.count} conversation${entry.count === 1 ? '' : 's'} on ${entry.date}`,
    createdAt: entry.date,
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-navy-800 dark:text-parchment-100">
        Overview
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
        Welcome back. Here&rsquo;s your study overview.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Documents"
          value={isLoading ? '...' : stats?.documents ?? 0}
          icon={<Files size={22} />}
          isLoading={isLoading}
        />
        <StatsCard
          label="Conversations"
          value={isLoading ? '...' : stats?.conversations ?? 0}
          icon={<MessageSquare size={22} />}
          isLoading={isLoading}
        />
        <StatsCard
          label="Quizzes Taken"
          value={isLoading ? '...' : stats?.quizzes ?? 0}
          icon={<GraduationCap size={22} />}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-parchment-300 bg-parchment-50 p-5 dark:border-navy-700 dark:bg-navy-800">
          <h2 className="font-heading text-base font-semibold text-navy-800 dark:text-parchment-100">
            Recent Activity
          </h2>
          <div className="mt-4">
            <RecentActivity activities={activities} isLoading={isLoading} />
          </div>
        </div>

        <WeakTopicsChart data={[]} />
      </div>
    </div>
  );
}
