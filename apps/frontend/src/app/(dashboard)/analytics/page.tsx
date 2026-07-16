'use client';

import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faFire, faTrophy, faClock, faBullseye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useApiClient } from '@/lib/api-client';
import { StudyHeatmap } from '@/components/dashboard/heatmap-chart';

export default function AnalyticsPage() {
  const api = useApiClient();
  const { data: stats, isLoading } = useSWR('/analytics/stats', (url) => api.get<any>(url));

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const hours = Math.floor((stats?.totalStudyMinutes || 0) / 60);
  const minutes = (stats?.totalStudyMinutes || 0) % 60;

  return (
    <div className="w-full h-full p-8 animate-message-appear flex flex-col gap-8 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Progress Analytics</h1>
        <p className="text-muted-fg">Visualize your study habits and improvements.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col gap-2 rounded-3xl border-border hover:border-brand-500/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-fg">
            <div className="p-2 rounded-full bg-brand-500/10 text-brand-500">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Study Time</span>
          </div>
          <div className="text-3xl font-bold">{hours}h <span className="text-lg text-muted-fg">{minutes}m</span></div>
          <div className="text-xs text-success flex items-center gap-1 mt-1">
            <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" /> Based on total sessions
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 rounded-3xl border-border hover:border-orange-500/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-fg">
            <div className="p-2 rounded-full bg-orange-500/10 text-orange-500">
              <FontAwesomeIcon icon={faFire} className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Quizzes Taken</span>
          </div>
          <div className="text-3xl font-bold">{stats?.quizzes || 0}</div>
          <div className="text-xs text-muted-fg flex items-center gap-1 mt-1">
            Keep it up!
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 rounded-3xl border-border hover:border-violet-500/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-fg">
            <div className="p-2 rounded-full bg-violet-500/10 text-violet-500">
              <FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Tasks Completed</span>
          </div>
          <div className="text-3xl font-bold">{stats?.tasksCompleted || 0}</div>
          <div className="text-xs text-success flex items-center gap-1 mt-1">
            <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" /> High completion rate
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 rounded-3xl border-border hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-fg">
            <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
              <FontAwesomeIcon icon={faTrophy} className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Avg Quiz Score</span>
          </div>
          <div className="text-3xl font-bold">{Math.round(stats?.averageScore || 0)}%</div>
          <div className="w-full bg-surface-3 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.round(stats?.averageScore || 0)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Heatmap Placeholder */}
        <div className="glass-card rounded-3xl p-6 lg:col-span-2 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Study Heatmap</h2>
          <div className="flex-1 flex items-center justify-center bg-surface-2 rounded-2xl border border-white/5">
            <StudyHeatmap data={stats?.heatmapData || []} />
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="glass-card rounded-3xl p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Time by Subject</h2>
          <div className="flex flex-col gap-4">
            {(!stats?.subjectsProgress || stats.subjectsProgress.length === 0) ? (
              <div className="text-muted-fg text-sm text-center p-4">No subjects data yet.</div>
            ) : (
              stats.subjectsProgress.map((subject: any) => {
                const percentage = stats.totalStudyMinutes > 0 ? (subject.study_minutes / stats.totalStudyMinutes) * 100 : 0;
                const h = Math.floor(subject.study_minutes / 60);
                const m = subject.study_minutes % 60;
                
                return (
                  <div key={subject.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{subject.name}</span>
                      <span className="text-muted-fg">{h}h {m}m</span>
                    </div>
                    <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: subject.color || '#3b82f6' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
