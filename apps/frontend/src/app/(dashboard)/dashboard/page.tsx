'use client';

import { useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/hooks/use-analytics';
import { StatsCard } from '@/components/dashboard/stats-card';
import { WeakTopicsChart } from '@/components/dashboard/weak-topics-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faCommentDots, faGraduationCap, faArrowRight, faChartPie } from '@fortawesome/free-solid-svg-icons';
import NextLink from 'next/link';

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

  const activities = (stats?.recentActivity ?? [])
    .slice(0, 3)
    .map((entry: any) => ({
      id: entry.id,
      type: entry.type as 'message' | 'document' | 'quiz' | 'room',
      description: entry.description,
      createdAt: new Date(entry.date).toLocaleDateString(),
    }));

  return (
    <article className="space-y-10 pb-10">
      {/* ── Massive Hero Banner ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface-1/40 p-6 sm:p-8 lg:p-12 shadow-2xl glass group">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-violet-500/10 opacity-70" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
        
        {/* Decorative background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none">
          <FontAwesomeIcon icon={faGraduationCap} className="w-[500px] h-[500px]" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            {greeting}
          </p>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Welcome back, <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-brand-400 to-violet-500 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted font-medium mb-10 max-w-2xl leading-relaxed">
            Your AI study companion is ready. Upload a new document, jump back into an active chat, or test your knowledge with a quiz.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <NextLink href="/documents" className="w-full sm:w-auto">
              <button className="w-full group relative inline-flex items-center justify-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] overflow-hidden">
                <FontAwesomeIcon icon={faFileLines} className="w-4 h-4" /> Upload PDF
              </button>
            </NextLink>
            
            <NextLink href="/chat" className="w-full sm:w-auto">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/50 px-6 py-3 text-sm font-bold text-foreground transition-all duration-300 hover:bg-surface-3 hover:border-border-bright backdrop-blur-sm">
                <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 text-brand-400" /> Start Chatting
              </button>
            </NextLink>
          </div>
        </div>
      </header>

      {/* ── Quick Actions Grid ─────────────────────────────────────────────── */}
      <section aria-label="Quick actions" className="space-y-4">
        <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2 px-1">
          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-brand-500" /> Quick Actions
        </h2>
        
        <div className="grid gap-4 md:gap-6 sm:grid-cols-3">
          {[
            {
              href: '/documents', icon: faFileLines, title: 'Process Document',
              desc: 'Extract & Embed PDF', 
              color: 'hover:border-cyan-500/40 group-hover:bg-cyan-500/10',
              iconColor: 'text-cyan-400',
              bg: 'bg-cyan-500/15'
            },
            {
              href: '/chat', icon: faCommentDots, title: 'Ask Questions',
              desc: 'Chat with citations', 
              color: 'hover:border-brand-500/40 group-hover:bg-brand-500/10',
              iconColor: 'text-brand-400',
              bg: 'bg-brand-500/15'
            },
            {
              href: '/quiz', icon: faGraduationCap, title: 'Take a Quiz',
              desc: 'Test your knowledge', 
              color: 'hover:border-violet-500/40 group-hover:bg-violet-500/10',
              iconColor: 'text-violet-400',
              bg: 'bg-violet-500/15'
            },
          ].map(({ href, icon, title, desc, color, iconColor, bg }) => (
            <NextLink
              key={href}
              href={href}
              className={`group flex flex-col p-6 rounded-2xl border border-border/60 bg-surface-1/40 glass transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${color}`}
            >
              <div className={`mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} transition-transform duration-300 group-hover:scale-110`}>
                <FontAwesomeIcon icon={icon} className={`text-xl ${iconColor}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground tracking-tight">{title}</p>
                <p className="text-sm text-muted mt-1">{desc}</p>
              </div>
            </NextLink>
          ))}
        </div>
      </section>

      {/* ── Stats & Data Grid ─────────────────────────────────────────────── */}
      <section aria-label="Analytics" className="space-y-4">
        <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2 px-1 mt-10">
          <FontAwesomeIcon icon={faChartPie} className="w-4 h-4 text-brand-500" /> Study Analytics
        </h2>
        
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Stats Cards - Span 1 column each */}
          <div className="flex flex-col gap-4 md:gap-6 lg:col-span-1">
            <StatsCard
              label="Documents Indexed"
              value={isLoading ? '—' : (stats?.documents ?? 0)}
              icon={<FontAwesomeIcon icon={faFileLines} className="w-5 h-5" />}
              isLoading={isLoading}
              accentColor="cyan"
              className="flex-1 rounded-2xl"
            />
            <StatsCard
              label="Conversations"
              value={isLoading ? '—' : (stats?.conversations ?? 0)}
              icon={<FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />}
              isLoading={isLoading}
              accentColor="brand"
              className="flex-1 rounded-2xl"
            />
          </div>

          {/* Recent Activity - Spans 2 columns */}
          <div className="lg:col-span-2">
            <div className="glass bg-surface-1/40 border border-border/60 rounded-3xl p-6 md:p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-muted mt-1">Your study sessions this week</p>
                </div>
              </div>
              <div className="flex-1">
                <RecentActivity activities={activities} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>

        {/* Weak Topics - Full Width */}
        <div className="mt-8">
          <div className="glass bg-surface-1/40 border border-border/60 rounded-3xl p-6 md:p-8">
             <WeakTopicsChart data={[]} />
          </div>
        </div>
      </section>
    </article>
  );
}
