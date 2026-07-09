'use client';

import { useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/hooks/use-analytics';
import { StatsCard } from '@/components/dashboard/stats-card';
import { WeakTopicsChart } from '@/components/dashboard/weak-topics-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faCommentDots, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { stats, isLoading } = useAnalytics();
  const { user } = useUser();

  const firstName = user?.firstName ?? 'there';
  const greeting = getGreeting();

  const activities = (stats?.recentActivity ?? []).map((entry, i) => ({
    id: `activity-${i}`,
    type: 'message' as const,
    description: `${entry.count} conversation${entry.count === 1 ? '' : 's'} on ${entry.date}`,
    createdAt: entry.date,
  }));

  return (
    <article className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-brand-400 mb-1">{greeting}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-muted">
            Here&apos;s your study overview for today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <NextLink href="/documents">
            <Button variant="secondary" size="md">
              <FontAwesomeIcon icon={faFileLines} className="w-[15px] h-[15px]" /> Upload PDF
            </Button>
          </NextLink>
          <NextLink href="/chat">
            <Button size="md">
              <FontAwesomeIcon icon={faCommentDots} className="w-[15px] h-[15px]" /> New Chat
            </Button>
          </NextLink>
        </div>
      </header>

      {/* ── Bento Grid ─────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)]">
        {/* Quick Actions - Spans 2 columns */}
        <section className="md:col-span-2 glass-card p-6 flex flex-col justify-between" aria-label="Quick actions">
          <div>
            <h2 className="text-lg font-bold text-foreground">Get Started</h2>
            <p className="text-xs text-muted mt-0.5">Jump right back into your workflow</p>
          </div>
          <div className="grid gap-3 mt-6 sm:grid-cols-3">
            {[
              {
                href: '/documents', icon: faFileLines, title: 'Upload PDF',
                desc: 'Add material', color: 'hover:border-border/80 hover:bg-surface-hover',
                iconColor: 'text-cyan-400'
              },
              {
                href: '/chat', icon: faCommentDots, title: 'Start Chat',
                desc: 'Ask questions', color: 'hover:border-border/80 hover:bg-surface-hover',
                iconColor: 'text-brand-400'
              },
              {
                href: '/quiz', icon: faGraduationCap, title: 'Take Quiz',
                desc: 'Test knowledge', color: 'hover:border-border/80 hover:bg-surface-hover',
                iconColor: 'text-violet-400'
              },
            ].map(({ href, icon, title, desc, color, iconColor }) => (
              <NextLink
                key={href}
                href={href}
                className={`flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-surface-1/50 transition-all duration-200 cursor-pointer ${color}`}
              >
                <FontAwesomeIcon icon={icon} className={`text-xl ${iconColor}`} />
                <div className="mt-2">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-[10px] text-muted mt-0.5">{desc}</p>
                </div>
              </NextLink>
            ))}
          </div>
        </section>

        {/* Stats Cards - Span 1 column each */}
        <div className="md:col-span-1">
          <StatsCard
            label="Documents"
            value={isLoading ? '—' : (stats?.documents ?? 0)}
            icon={<FontAwesomeIcon icon={faFileLines} className="w-5 h-5" />}
            isLoading={isLoading}
            accentColor="cyan"
            className="h-full"
          />
        </div>
        <div className="md:col-span-1">
          <StatsCard
            label="Conversations"
            value={isLoading ? '—' : (stats?.conversations ?? 0)}
            icon={<FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />}
            isLoading={isLoading}
            accentColor="brand"
            className="h-full"
          />
        </div>

        {/* Recent Activity - Spans 2 columns */}
        <section className="md:col-span-2 glass-card p-6" aria-labelledby="recent-activity-heading">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="recent-activity-heading" className="text-lg font-bold text-foreground">
                Recent Activity
              </h2>
              <p className="text-xs text-muted mt-0.5">Your study sessions this week</p>
            </div>
          </div>
          <RecentActivity activities={activities} isLoading={isLoading} />
        </section>

        {/* Weak Topics - Spans 2 columns */}
        <div className="md:col-span-2">
          <WeakTopicsChart data={[]} />
        </div>
      </div>
    </article>
  );
}
