'use client';

import { useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/hooks/use-analytics';
import { useMounted } from '@/hooks/use-mounted';
import { formatDate } from '@/lib/utils';
import { StatsCard } from '@/components/dashboard/stats-card';
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';
import { StudyHeatmap } from '@/components/dashboard/heatmap-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faCommentDots, faGraduationCap, faArrowRight, faChartPie, faListCheck, faUsers, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import NextLink from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { stats, isLoading } = useAnalytics();
  const api = useApiClient();
  const { data: tasks, isLoading: tasksLoading } = useSWR('/tasks', (url) => api.get<any[]>(url));
  const { user } = useUser();

  const firstName = user?.firstName ?? 'there';
  const greeting = getGreeting();

  const mounted = useMounted();

  const activities = (stats?.recentActivity ?? [])
    .slice(0, 3)
    .map((entry: any) => ({
      id: entry.id,
      type: entry.type as 'message' | 'document' | 'quiz' | 'room',
      description: entry.description,
      createdAt: mounted ? formatDate(entry.date) : '',
    }));

  return (
    <article className="space-y-8 pb-8">
      {/* ── Massive Hero Banner ────────────────────────────────────────────── */}
      <ScrollReveal delay={0}>
        <header className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface-1/40 p-5 sm:p-8 shadow-2xl glass group">
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
            
            <p className="text-base md:text-lg text-muted font-medium mb-8 max-w-2xl leading-relaxed">
              Your AI study companion is ready. Upload a new document, jump back into an active chat, or test your knowledge with a quiz.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <NextLink href="/documents" className="w-full sm:w-auto">
                <button type="button" className="w-full group relative inline-flex items-center justify-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] overflow-hidden">
                  <FontAwesomeIcon icon={faFileLines} className="w-3.5 h-3.5" /> Upload PDF
                </button>
              </NextLink>
              
              <NextLink href="/chat" className="w-full sm:w-auto">
                <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/50 px-5 py-2.5 text-[13px] font-bold text-foreground transition-all duration-300 hover:bg-surface-3 hover:border-border-bright backdrop-blur-sm">
                  <FontAwesomeIcon icon={faCommentDots} className="w-3.5 h-3.5 text-brand-400" /> Start Chatting
                </button>
              </NextLink>
            </div>
          </div>
        </header>
      </ScrollReveal>

      {/* ── Quick Actions Grid ─────────────────────────────────────────────── */}
      <ScrollReveal delay={100}>
        <section aria-label="Quick actions" className="space-y-4">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2 px-1">
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-brand-500" /> Quick Actions
          </h2>
          
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
              {
                href: '/tasks', icon: faListCheck, title: 'Manage Tasks',
                desc: 'Track assignments', 
                color: 'hover:border-emerald-500/40 group-hover:bg-emerald-500/10',
                iconColor: 'text-emerald-400',
                bg: 'bg-emerald-500/15'
              },
              {
                href: '/rooms', icon: faUsers, title: 'Study Rooms',
                desc: 'Collaborate live', 
                color: 'hover:border-orange-500/40 group-hover:bg-orange-500/10',
                iconColor: 'text-orange-400',
                bg: 'bg-orange-500/15'
              },
            ].map(({ href, icon, title, desc, color, iconColor, bg }) => (
              <NextLink
                key={href}
                href={href}
                className={`group flex flex-col p-4 rounded-2xl border border-border/60 bg-surface-1/40 glass transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl ${color}`}
              >
                <div className={`mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} transition-transform duration-300 group-hover:scale-110`}>
                  <FontAwesomeIcon icon={icon} className={`text-base ${iconColor}`} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-foreground tracking-tight">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </NextLink>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── Active Pipeline ─────────────────────────────────────────────── */}
      <ScrollReveal delay={150}>
        <section aria-label="Active pipeline" className="space-y-4">
          <div className="flex items-center justify-between px-1 mt-10">
            <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FontAwesomeIcon icon={faListCheck} className="w-4 h-4 text-brand-500" /> Active Pipeline
            </h2>
            <NextLink href="/tasks" className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Open Task Flow &rarr;
            </NextLink>
          </div>
          
          <div className="glass bg-surface-1/40 border border-border/60 rounded-2xl p-5 md:p-6">
            {tasksLoading ? (
              <div className="text-center text-muted text-sm p-4 animate-pulse">Loading tasks...</div>
            ) : (!tasks || tasks.filter(t => t.status !== 'completed').length === 0) ? (
              <div className="text-center p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-6 h-6" />
                </div>
                <p className="text-foreground font-semibold text-lg mb-1">All caught up!</p>
                <p className="text-muted text-sm">Your pipeline is empty. Enjoy your day!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
                  <div key={task.id} className="p-4 rounded-xl bg-surface-2 border border-border/50 flex flex-col hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground truncate mr-2">{task.title}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-surface-3 text-muted">
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted line-clamp-2 mb-4 flex-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs font-semibold mt-auto text-brand-400 pt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* ── Stats & Data Grid ─────────────────────────────────────────────── */}
      <section aria-label="Analytics" className="space-y-4">
        <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2 px-1 mt-10">
          <FontAwesomeIcon icon={faChartPie} className="w-4 h-4 text-brand-500" /> Study Analytics
        </h2>
        
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Stats Cards - Span 1 column each */}
          <ScrollReveal delay={200} direction="up" className="flex flex-col gap-4 md:gap-6 lg:col-span-1">
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
          </ScrollReveal>

          {/* Recent Activity - Spans 2 columns */}
          <ScrollReveal delay={300} direction="up" className="lg:col-span-2">
            <div className="glass bg-surface-1/40 border border-border/60 rounded-2xl p-5 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                    Recent Activity
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Your study sessions this week</p>
                </div>
              </div>
              <div className="flex-1">
                <RecentActivity activities={activities} isLoading={isLoading} />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Month Based Calendar Stats - Full Width */}
        <ScrollReveal delay={400} direction="up" className="mt-6">
          <div className="glass bg-surface-1/40 border border-border/60 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                  Study Consistency
                </h3>
                <p className="text-xs text-muted mt-0.5">Your 28-day activity calendar</p>
              </div>
            </div>
            <div className="flex items-center justify-center bg-surface-2 rounded-2xl border border-white/5 py-4">
              <StudyHeatmap data={stats?.heatmapData || []} />
            </div>
          </div>
        </ScrollReveal>
      </section>
    </article>
  );
}
