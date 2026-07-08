'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/hooks/use-quiz';
import { useApiClient } from '@/lib/api-client';
import { QuestionCard } from '@/components/quiz/question-card';
import { DifficultyBadge } from '@/components/quiz/difficulty-badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';
import Link from 'next/link';

export default function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { quiz, isLoading } = useQuiz(id);
  const api = useApiClient();
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-500 dark:text-brand-300 w-6 h-6" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-ink-400 dark:text-ink-200">
          Quiz not found
        </p>
      </div>
    );
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error('Answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const { id: attemptId } = await api.post<{ id: string }>(`/quiz/${quiz.id}/attempt`);
      const result = await api.post<{ score: number; weakTopics: string[] }>(
        `/quiz/${quiz.id}/attempt/${attemptId}/submit`,
        { answers },
      );
      router.push(`/quiz/${quiz.id}/results?score=${result.score}`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = quiz.questions.length === Object.keys(answers).length;

  return (
    <div>
      <Link
        href="/quiz"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 dark:text-ink-200"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to quizzes
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink-600 dark:text-cream-100">
            {quiz.title}
          </h1>
          <div className="mt-2">
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {quiz.questions.map((q) => (
          <QuestionCard
            key={q.id}
            questionId={q.id}
            question={q.question}
            questionType={q.questionType}
            options={q.options}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : null}
          Submit all answers
        </button>
      </div>
    </div>
  );
}
