import { SWRProvider } from '@/components/providers/swr-provider';
import DashboardClient from './dashboard-client';
import { apiServer } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let fallback = {};
  
  try {
    const [analytics, tasks] = await Promise.all([
      apiServer<any>('/analytics'),
      apiServer<any[]>('/tasks'),
    ]);
    fallback = { 
      '/analytics': analytics,
      '/tasks': tasks
    };
  } catch (err) {
    console.error('Failed to prefetch dashboard data:', err);
  }

  return (
    <SWRProvider fallback={fallback}>
      <DashboardClient />
    </SWRProvider>
  );
}
