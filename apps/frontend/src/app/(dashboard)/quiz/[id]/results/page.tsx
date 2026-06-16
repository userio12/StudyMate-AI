'use client';

import { use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ScoreCircle } from '@/components/quiz/score-circle';
import { ArrowLeft, RotateCcw } from 'lucide-react';

function ResultsContent({ quizId }: { quizId: string }) {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get('score') ?? 0);

  return (
    <div className="flex flex-col items-center gap-6">
      <Link
        href={`/quiz/${quizId}`}
        className="self-start inline-flex items-center gap-1 text-sm text-navy-600 hover:text-navy-800 dark:text-parchment-400"
      >
        <ArrowLeft size={16} />
        Back to quiz
      </Link>

      <div className="flex flex-col items-center gap-4">
        <h1 className="font-heading text-xl font-semibold text-navy-800 dark:text-parchment-100">
          Quiz Results
        </h1>
        <ScoreCircle score={score} size={120} />
        <p className="text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
          {score >= 80
            ? 'Great job! You know this material well.'
            : score >= 50
              ? 'Good effort. Review the areas you missed.'
              : 'Keep studying. Try reviewing the material again.'}
        </p>
      </div>

      <Link
        href="/quiz"
        className="inline-flex items-center gap-2 rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
      >
        <RotateCcw size={16} />
        Try another quiz
      </Link>
    </div>
  );
}

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta-500 border-t-transparent" />
        </div>
      }
    >
      <ResultsContent quizId={id} />
    </Suspense>
  );
}
