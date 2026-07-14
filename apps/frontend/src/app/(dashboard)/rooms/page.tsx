import { SWRProvider } from '@/components/providers/swr-provider';
import RoomsClient from './rooms-client';
import { apiServer } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  let fallback = {};
  
  try {
    const rooms = await apiServer<any[]>('/rooms');
    fallback = { '/rooms': rooms };
  } catch (err) {
    console.error('Failed to prefetch rooms:', err);
  }

  return (
    <SWRProvider fallback={fallback}>
      <RoomsClient />
    </SWRProvider>
  );
}
