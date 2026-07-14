import { SWRProvider } from '@/components/providers/swr-provider';
import DocumentsClient from './documents-client';
import { apiServer } from '@/lib/api-server';
import { Document } from '@studymate/shared';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  let fallback = {};
  
  try {
    const documents = await apiServer<Document[]>('/documents');
    fallback = { '/documents': documents };
  } catch (err) {
    console.error('Failed to prefetch documents:', err);
  }

  return (
    <SWRProvider fallback={fallback}>
      <DocumentsClient />
    </SWRProvider>
  );
}
