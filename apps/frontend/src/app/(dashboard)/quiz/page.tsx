'use client';

import { QuizCard } from '@/components/quiz/quiz-card';
import { PersonaBadge } from '@/components/chat/persona-badge';
import { GenerateQuizModal } from '@/components/quiz/generate-quiz-modal';
import { useQuizzes } from '@/hooks/use-quiz';
import { useTrustLevel } from '@/hooks/use-trust-level';
import { useApiClient } from '@/lib/api-client';
import { PERSONA_LABELS, PERSONA_DESCRIPTIONS } from '@studymate/shared';
import type { DifficultyLevel } from '@studymate/shared';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faPlus } from '@fortawesome/free-solid-svg-icons';
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
  const { trustLevel, persona } = useTrustLevel();
  const api = useApiClient();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const defaultDifficulty = trustToDifficulty[trustLevel] ?? 'intermediate';

  const difficultyLabel: Record<DifficultyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const handleGenerate = async (difficulty: DifficultyLevel) => {
    const readyDocs = documents.filter((d) => d.status === 'ready');
    if (readyDocs.length === 0) {
      toast.error('Upload and process at least one document first');
      setModalOpen(false);
      return;
    }

    setGenerating(true);
    try {
      await api.post('/quiz/generate', {
        documentIds: readyDocs.map((d) => d.id),
        difficulty,
      });
      await mutate();
      toast.success(`Quiz generated at ${difficultyLabel[difficulty]} level`);
      setModalOpen(false);
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
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Quiz
            </h1>
            <PersonaBadge
              persona={persona}
              label={PERSONA_LABELS[persona]}
              description={PERSONA_DESCRIPTIONS[persona]}
            />
          </div>
          <p className="mt-1 text-sm text-muted">
            Generate and take adaptive quizzes from your documents.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 brand-glow hover:scale-[1.02] active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Generate quiz
        </button>
      </div>

      <GenerateQuizModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        defaultDifficulty={defaultDifficulty} 
        onGenerate={handleGenerate} 
        generating={generating} 
      />

      {isLoading ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-white/30 dark:bg-white/5"
            />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-card mt-12 flex flex-col items-center gap-3 py-16 text-center border-brand-500/20 max-w-2xl mx-auto">
          <div className="studymate-glow rounded-full p-4">
            <FontAwesomeIcon icon={faGraduationCap} className="text-white w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted">
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
