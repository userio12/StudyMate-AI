'use client';

import dynamic from 'next/dynamic';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface WeakTopicsChartProps {
  data: Array<{ topic: string; score: number }>;
}

const ChartContent = ({ data }: WeakTopicsChartProps) => {
  return (
    <div className="rounded-xl border border-parchment-300 bg-parchment-50 p-5 dark:border-navy-700 dark:bg-navy-800">
      <h3 className="font-heading text-base font-semibold text-navy-800 dark:text-parchment-100">
        Weak Topics
      </h3>
      <div className="mt-4 w-full">
        <ResponsiveContainer width="100%" height={256} minWidth={0}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
            <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#c86e4b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Wrap the entire component in a single dynamic boundary with SSR disabled
// to avoid hydration mismatches and minimize chunk fragmentation.
export const WeakTopicsChart = dynamic(
  () => Promise.resolve(ChartContent),
  { ssr: false, loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-parchment-100 dark:bg-navy-700" /> }
);
