import { SWRProvider } from '@/components/providers/swr-provider';
import TasksClient from './tasks-client';
import { apiServer } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  let fallback = {};
  
  try {
    const [tasks, stats] = await Promise.all([
      apiServer<any[]>('/tasks'),
      apiServer<any>('/analytics/stats'),
    ]);
    fallback = { 
      '/tasks': tasks,
      '/analytics/stats': stats
    };
  } catch (err) {
    console.error('Failed to prefetch tasks data:', err);
  }

  return (
    <SWRProvider fallback={fallback}>
      <TasksClient />
    </SWRProvider>
  );
}
