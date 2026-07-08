'use client';

import { use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ScoreCircle } from '@/components/quiz/score-circle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

function ResultsContent({ quizId }: { quizId: string }) {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get('score') ?? 0);

  const encouragement = score >= 80
    ? 'Great job! You know this material well.'
    : score >= 50
      ? 'Good effort. Review the areas you missed.'
      : 'Keep studying. Try reviewing the material again.';

  return (
    <div className="flex flex-col items-center gap-6">
      <Link
        href={`/quiz/${quizId}`}
        className="self-start inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 dark:text-ink-200"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to quiz
      </Link>

      <div className="glass-card flex flex-col items-center gap-6 p-8">
        <h1 className="font-heading text-xl font-bold text-ink-600 dark:text-cream-100">
          Quiz Results
        </h1>
        <ScoreCircle score={score} size={120} />
        <p className="text-sm leading-relaxed text-center text-ink-400 dark:text-ink-200">
          {encouragement}
        </p>
      </div>

      <Link
        href="/quiz"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-600 active:bg-brand-700"
      >
        <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4" />
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <ResultsContent quizId={id} />
    </Suspense>
  );
}
