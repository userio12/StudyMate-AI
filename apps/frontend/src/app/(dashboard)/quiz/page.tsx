import { SWRProvider } from '@/components/providers/swr-provider';
import QuizClient from './quiz-client';
import { apiServer } from '@/lib/api-server';
import { Document } from '@studymate/shared';

export const dynamic = 'force-dynamic';

export default async function QuizPage() {
  let fallback = {};
  
  try {
    const [quizzes, documents] = await Promise.all([
      apiServer<any[]>('/quiz/list'),
      apiServer<Document[]>('/documents'),
    ]);
    fallback = { 
      '/quiz/list': quizzes,
      '/documents': documents
    };
  } catch (err) {
    console.error('Failed to prefetch quiz data:', err);
  }

  return (
    <SWRProvider fallback={fallback}>
      <QuizClient />
    </SWRProvider>
  );
}
