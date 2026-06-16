'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

const BarChart = dynamic(
  () => import('recharts').then((m) => m.BarChart),
  { ssr: false },
);
const Bar = dynamic(
  () => import('recharts').then((m) => m.Bar),
  { ssr: false },
);
const XAxis = dynamic(
  () => import('recharts').then((m) => m.XAxis),
  { ssr: false },
);
const YAxis = dynamic(
  () => import('recharts').then((m) => m.YAxis),
  { ssr: false },
);
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false },
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);

interface WeakTopicsChartProps {
  data: Array<{ topic: string; score: number }>;
}

const Chart = ({ data }: WeakTopicsChartProps) => {
  const allCharts = {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  };

  return (
    <div className="rounded-xl border border-parchment-300 bg-parchment-50 p-5 dark:border-navy-700 dark:bg-navy-800">
      <h3 className="font-heading text-base font-semibold text-navy-800 dark:text-parchment-100">
        Weak Topics
      </h3>
      <div className="mt-4 h-64">
        <allCharts.ResponsiveContainer width="100%" height="100%">
          <allCharts.BarChart data={data}>
            <allCharts.CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
            <allCharts.XAxis dataKey="topic" tick={{ fontSize: 12 }} />
            <allCharts.YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <allCharts.Tooltip />
            <allCharts.Bar dataKey="score" fill="#c86e4b" radius={[4, 4, 0, 0]} />
          </allCharts.BarChart>
        </allCharts.ResponsiveContainer>
      </div>
    </div>
  );
};

export function WeakTopicsChart(props: WeakTopicsChartProps) {
  return <Chart {...props} />;
}
