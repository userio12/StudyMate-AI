'use client';

import { use, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScoreCircle } from '@/components/quiz/score-circle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilePdf, faPlus } from '@fortawesome/free-solid-svg-icons';
import { GenerateQuizModal } from '@/components/quiz/generate-quiz-modal';
import { useTrustLevel } from '@/hooks/use-trust-level';
import { useDocuments } from '@/hooks/use-documents';
import { useApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';
import { useAiModelPreferences } from '@/hooks/use-ai-models';
import type { DifficultyLevel } from '@studymate/shared';
import jsPDF from 'jspdf';

const trustToDifficulty: Record<string, DifficultyLevel> = {
  stranger: 'beginner',
  acquaintance: 'beginner',
  friend: 'intermediate',
  study_partner: 'intermediate',
  mentor: 'advanced',
};

function ResultsContent({ quizId }: { quizId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = Number(searchParams.get('score') ?? 0);
  
  const { trustLevel } = useTrustLevel();
  const { documents } = useDocuments();
  const { quizProvider, openRouterQuizModel } = useAiModelPreferences();
  const api = useApiClient();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const defaultDifficulty = trustToDifficulty[trustLevel] ?? 'intermediate';

  const encouragement = score >= 80
    ? 'Great job! You know this material well.'
    : score >= 50
      ? 'Good effort. Review the areas you missed.'
      : 'Keep studying. Try reviewing the material again.';

  const handleDownloadPDF = () => {
    try {
      const data = sessionStorage.getItem(`quizResult_${quizId}`);
      if (!data) {
        toast.error('Quiz data no longer available in this session.');
        return;
      }
      
      const result = JSON.parse(data);
      const doc = new jsPDF();
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('StudyMate AI - Quiz Report', 20, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444');
      doc.text(`Score: ${result.score}%`, 20, 32);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      
      let yPos = 45;
      
      result.details.forEach((d: any, i: number) => {
        // Check page break
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Q${i + 1}: ${d.question}`, 20, yPos, { maxWidth: 170 });
        
        // Calculate text height
        const textLines = doc.splitTextToSize(`Q${i + 1}: ${d.question}`, 170);
        yPos += (textLines.length * 6) + 2;
        
        // Print Options
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#334155');
        d.options?.forEach((opt: string, optIdx: number) => {
          const letter = String.fromCharCode(65 + optIdx);
          doc.text(`${letter}) ${opt}`, 25, yPos, { maxWidth: 165 });
          const optLines = doc.splitTextToSize(`${letter}) ${opt}`, 165);
          yPos += (optLines.length * 6) + 1;
        });
        
        yPos += 2; // Small gap before answers

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(d.correct ? '#16a34a' : '#dc2626');
        doc.text(`Your Answer: ${d.userAnswer}`, 25, yPos, { maxWidth: 165 });
        const userAnsLines = doc.splitTextToSize(`Your Answer: ${d.userAnswer}`, 165);
        yPos += (userAnsLines.length * 6) + 1;
        
        if (!d.correct) {
          doc.setTextColor('#16a34a');
          doc.text(`Correct Answer: ${d.correctAnswer}`, 25, yPos, { maxWidth: 165 });
          const correctAnsLines = doc.splitTextToSize(`Correct Answer: ${d.correctAnswer}`, 165);
          yPos += (correctAnsLines.length * 6) + 1;
        }
        
        doc.setTextColor('#000000');
        yPos += 8; // space between questions
      });
      
      doc.save(`quiz-report-${quizId}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  const handleGenerateQuiz = async (difficulty: DifficultyLevel, topic?: string) => {
    const readyDocs = documents.filter((d) => d.status === 'ready');
    if (readyDocs.length === 0) {
      toast.error('Upload and process at least one document first');
      setModalOpen(false);
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post<{ id: string }>('/quiz/generate', {
        documentIds: readyDocs.map((d) => d.id),
        difficulty,
        topic,
        quizProvider,
        quizModel: openRouterQuizModel,
      });
      toast.success('New quiz generated successfully!');
      setModalOpen(false);
      setGenerating(false);
      router.push(`/quiz/${response.id}`);
    } catch (err) {
      toast.error(handleApiError(err));
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Link
        href="/quiz"
        className="self-start inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 dark:text-ink-200"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to quizzes
      </Link>

      <div className="glass-card flex flex-col items-center gap-6 p-8 w-full max-w-xl">
        <h1 className="font-heading text-xl font-bold text-ink-600 dark:text-cream-100">
          Quiz Results
        </h1>
        <ScoreCircle score={score} size={120} />
        <p className="text-sm leading-relaxed text-center text-ink-400 dark:text-ink-200">
          {encouragement}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 rounded-lg bg-surface-2 border border-border px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-surface-3"
        >
          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-red-500" />
          Download PDF Report
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-600 active:bg-brand-700"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Generate New Quiz
        </button>
      </div>

      <GenerateQuizModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        defaultDifficulty={defaultDifficulty} 
        onGenerate={handleGenerateQuiz} 
        generating={generating} 
      />
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
