'use client';

import { useMounted } from '@/hooks/use-mounted';

interface TopicData {
  topic: string;
  score: number;   // 0–100 (lower = weaker)
}

interface WeakTopicsChartProps {
  data: TopicData[];
}

export function WeakTopicsChart({ data }: WeakTopicsChartProps) {
  const mounted = useMounted();

  const hasData = data.length > 0;

  const placeholder: TopicData[] = [
    { topic: 'No quiz data yet', score: 0 },
  ];

  const items = hasData ? data.slice(0, 6) : placeholder;

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Weak Topics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Areas to focus on</p>
        </div>
        {hasData && (
          <span className="label-caps text-slate-600">Score</span>
        )}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Take a quiz to see your weak spots</p>
          <p className="mt-1 text-xs text-slate-600">Topic analysis will appear here after your first quiz</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ topic, score }, i) => {
            const pct = Math.round(score);
            const isWeak = pct < 60;
            const barColor = pct < 40
              ? 'from-red-500 to-red-400'
              : pct < 60
              ? 'from-amber-500 to-amber-400'
              : 'from-brand-500 to-violet-500';

            return (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-300 truncate max-w-[70%]">{topic}</span>
                  <span className={`text-sm font-bold ${isWeak ? 'text-red-400' : 'text-emerald-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${barColor} ${mounted ? 'bar-fill' : ''}`}
                    style={{
                      width: `${pct}%`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
