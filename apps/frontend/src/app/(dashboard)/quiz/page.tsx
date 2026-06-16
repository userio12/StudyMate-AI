'use client';

import { QuizCard } from '@/components/quiz/quiz-card';
import { PersonaBadge } from '@/components/chat/persona-badge';
import { useQuizzes } from '@/hooks/use-quiz';
import { useTrustLevel } from '@/hooks/use-trust-level';
import { useApiClient } from '@/lib/api-client';
import { PERSONA_LABELS, PERSONA_DESCRIPTIONS } from '@studymate/shared';
import type { DifficultyLevel } from '@studymate/shared';
import { GraduationCap, Loader2, Plus, Brain } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';
import { useDocuments } from '@/hooks/use-documents';

const trustToDifficulty: Record<string, DifficultyLevel> = {
  stranger: 'beginner',
  acquaintance: 'beginner',
  friend: 'intermediate',
  study_partner: 'intermediate',
  mentor: 'advanced',
};

export default function QuizPage() {
  const { quizzes, isLoading, mutate } = useQuizzes();
  const { documents } = useDocuments();
  const { trustLevel, persona, showAdvancedFeatures } = useTrustLevel();
  const api = useApiClient();
  const [generating, setGenerating] = useState(false);

  const defaultDifficulty = trustToDifficulty[trustLevel] ?? 'intermediate';

  const difficultyLabel: Record<DifficultyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const handleGenerate = async () => {
    const readyDocs = documents.filter((d) => d.status === 'ready');
    if (readyDocs.length === 0) {
      toast.error('Upload and process at least one document first');
      return;
    }

    setGenerating(true);
    try {
      await api.post('/quiz/generate', {
        documentIds: readyDocs.map((d) => d.id),
        difficulty: defaultDifficulty,
      });
      await mutate();
      toast.success(`Quiz generated at ${difficultyLabel[defaultDifficulty]} level`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-navy-800 dark:text-parchment-100">
              Quiz
            </h1>
            <PersonaBadge
              persona={persona}
              label={PERSONA_LABELS[persona]}
              description={PERSONA_DESCRIPTIONS[persona]}
            />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
            Generate and take adaptive quizzes from your documents.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Generate quiz
        </button>
      </div>

      {showAdvancedFeatures && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy-50 p-3 dark:bg-navy-800">
          <Brain size={16} className="text-navy-500 dark:text-navy-300 shrink-0" />
          <p className="prose text-xs leading-relaxed text-navy-600 dark:text-parchment-400">
            Adaptive difficulty: generating at <strong>{difficultyLabel[defaultDifficulty]}</strong> level based on your study history.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-parchment-200 dark:bg-navy-800"
            />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="studymate-glow rounded-full p-4">
            <GraduationCap size={24} className="text-white" />
          </div>
          <p className="text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
            No quizzes yet. Generate one from your documents.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              difficulty={quiz.difficulty}
              questionCount={quiz.questionCount}
              createdAt={quiz.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
