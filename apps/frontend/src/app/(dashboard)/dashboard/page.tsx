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
    <article>
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-2 text-base text-muted-foreground font-sans">
          Welcome back. Here&rsquo;s your study overview.
        </p>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-3" aria-label="Quick statistics">
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
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-none border border-border bg-surface p-8 shadow-warm" aria-labelledby="recent-activity-heading">
          <h2 id="recent-activity-heading" className="font-heading text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <div className="mt-6">
            <RecentActivity activities={activities} isLoading={isLoading} />
          </div>
        </section>

        <section aria-labelledby="weak-topics-heading">
          <h2 id="weak-topics-heading" className="sr-only">Weak Topics</h2>
          <WeakTopicsChart data={[]} />
        </section>
      </div>
    </article>
  );
}
