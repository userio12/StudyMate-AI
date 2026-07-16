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
import { faGraduationCap, faPlus, faListCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';
import { useDocuments } from '@/hooks/use-documents';
import { useAiModelPreferences } from '@/hooks/use-ai-models';

const trustToDifficulty: Record<string, DifficultyLevel> = {
  stranger: 'beginner',
  acquaintance: 'beginner',
  friend: 'intermediate',
  study_partner: 'intermediate',
  mentor: 'advanced',
};

export default function QuizPage() {
  const { quizzes, isLoading, mutate, updateQuiz, deleteQuiz } = useQuizzes();
  const { documents } = useDocuments();
  const { trustLevel, persona } = useTrustLevel();
  const { quizProvider, openRouterQuizModel } = useAiModelPreferences();
  const api = useApiClient();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const defaultDifficulty = trustToDifficulty[trustLevel] ?? 'intermediate';

  const difficultyLabel: Record<DifficultyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    adaptive: 'Adaptive',
  };

  const handleGenerate = async (difficulty: DifficultyLevel, topic?: string, documentId?: string, questionCount?: number) => {
    const readyDocs = documents.filter((d) => d.status === 'ready');
    if (readyDocs.length === 0) {
      toast.error('Upload and process at least one document first');
      setModalOpen(false);
      return;
    }

    setGenerating(true);
    try {
      const documentIds = documentId ? [documentId] : readyDocs.map((d) => d.id);
      
      await api.post('/quiz/generate', {
        documentIds,
        difficulty,
        questionCount,
        topic,
        quizProvider,
        quizModel: openRouterQuizModel,
      });
      await mutate();
      toast.success(`Quiz generated at ${difficultyLabel[difficulty]} level`);
      setModalOpen(false);
      setGenerating(false);
    } catch (err) {
      toast.error(handleApiError(err));
      setGenerating(false);
    }
  };

  return (
    <div className="pb-10">
      
      {/* ── Hero Control Panel ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface-1/40 p-5 sm:p-6 lg:p-8 mb-8 shadow-lg glass group">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-brand-500/10 opacity-70" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 mb-3 justify-center lg:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Adaptive Quizzes
              </h1>
              <div className="hidden lg:block">
                <PersonaBadge
                  persona={persona}
                  label={PERSONA_LABELS[persona] || ''}
                  description={PERSONA_DESCRIPTIONS[persona] || ''}
                />
              </div>
            </div>
            <p className="text-sm sm:text-[15px] text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Test your knowledge. Our AI dynamically generates challenging, adaptive quizzes directly from your uploaded study materials.
            </p>
          </div>
          
          <div className="w-full lg:w-auto shrink-0">
            <button type="button" 
              onClick={() => setModalOpen(true)}
              className="w-full lg:w-auto group/btn relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-base font-extrabold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] overflow-hidden border-0"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-90" />
              Generate New Quiz
            </button>
          </div>
        </div>
      </header>

      <GenerateQuizModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        defaultDifficulty={defaultDifficulty}
        documents={documents.filter((d) => d.status === 'ready')}
        onGenerate={handleGenerate} 
        generating={generating} 
      />

      {/* ── Quizzes List ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between px-1 mb-6">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <FontAwesomeIcon icon={faListCheck} className="w-4 h-4 text-violet-500" /> Your Quizzes
          </h2>
          {!isLoading && quizzes.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-muted-fg border border-border">
              {quizzes.length} Quiz{quizzes.length === 1 ? '' : 'zes'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-lg font-bold text-foreground animate-pulse">
              Loading your quizzes...
            </p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="glass-card mt-4 flex flex-col items-center gap-4 py-20 text-center rounded-2xl md:rounded-3xl border-dashed border-2 hover:border-violet-500/30 transition-colors cursor-pointer" onKeyDown={(e) => { if(e.key === "Enter") {/* handled */} }} role="button" tabIndex={0} onClick={() => setModalOpen(true)}>
            <div className="rounded-2xl bg-violet-500/10 p-5 border border-violet-500/20">
              <FontAwesomeIcon icon={faGraduationCap} className="text-violet-400 w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                No quizzes yet
              </p>
              <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
                Click here or use the button above to generate your first adaptive quiz from your documents.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.slice().sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }).map((quiz) => (
              <QuizCard
                key={quiz.id}
                id={quiz.id}
                title={quiz.title}
                difficulty={quiz.difficulty}
                questionCount={quiz.questionCount}
                isPinned={quiz.isPinned}
                createdAt={quiz.createdAt}
                onUpdate={updateQuiz}
                onDelete={deleteQuiz}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
