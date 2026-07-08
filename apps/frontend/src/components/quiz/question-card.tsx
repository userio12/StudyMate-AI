'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

interface QuestionCardContext {
  questionId: string;
  question: string;
  questionType: string;
  options?: string[];
  onAnswer: (questionId: string, answer: string) => void;
  selectedAnswer?: string;
  showResult?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
  explanation?: string;
}

function QuestionCardRoot({
  children,
  questionId,
  question,
  questionType,
  options,
  onAnswer,
  showResult,
  showExplanation,
  questionNumber,
}: {
  children?: ReactNode;
  questionId: string;
  question: string;
  questionType: string;
  options?: string[];
  onAnswer: (questionId: string, answer: string) => void;
  showResult?: boolean;
  showExplanation?: boolean;
  questionNumber?: number;
}) {
  const [selected, setSelected] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (answer: string) => {
    if (submitted) return;
    setSelected(answer);
    onAnswer(questionId, answer);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  const typeLabel = questionType.replace(/_/g, ' ');

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-border p-6">
        {questionNumber != null && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-sm font-bold text-white brand-glow">
            {questionNumber}
          </div>
        )}
        <div className="flex-1">
          <span className="label-caps text-brand-400 mb-2 block">{typeLabel}</span>
          <p className="text-base font-semibold leading-snug text-slate-100">{question}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Multiple choice options */}
        {options && (
          <div className="space-y-2.5">
            {options.map((option, i) => {
              const isSelected = selected === option;
              const optionLabel = String.fromCharCode(65 + i);

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  disabled={submitted}
                  className={cn(
                    'flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200',
                    'min-h-[52px]',
                    isSelected
                      ? 'brand-gradient border-transparent text-white brand-glow'
                      : 'border-border bg-surface-1 text-slate-300 hover:border-border-bright hover:bg-surface-2 hover:text-slate-100',
                    submitted && !isSelected && 'opacity-50',
                  )}
                >
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-2 text-slate-500',
                  )}>
                    {optionLabel}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {/* Short answer */}
        {questionType === 'short_answer' && (
          <textarea
            value={selected ?? ''}
            onChange={(e) => handleSelect(e.target.value)}
            placeholder="Type your answer..."
            aria-label="Your answer"
            disabled={submitted}
            rows={3}
            className={cn(
              'w-full resize-none rounded-xl bg-surface-1 border border-border px-4 py-3',
              'text-sm text-slate-200 placeholder:text-slate-600',
              'focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 focus:outline-none',
              'transition-all duration-200',
            )}
          />
        )}

        {/* Submit button */}
        {!submitted && selected && (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white brand-glow transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3.5 h-3.5" /> Submit answer
          </button>
        )}

        {children}

        {/* Feedback */}
        {submitted && showExplanation && selected && (
          <div className={cn(
            'flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium',
            showResult !== false
              ? 'bg-success/10 border border-success/25 text-emerald-300'
              : 'bg-error-dim border border-error/25 text-red-300',
          )}>
            {showResult !== false
              ? <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 mt-0.5 w-[17px] h-[17px]" />
              : <FontAwesomeIcon icon={faCircleXmark} className="shrink-0 mt-0.5 w-[17px] h-[17px]" />}
            {showResult !== false ? 'Correct!' : 'Incorrect'}
          </div>
        )}
      </div>
    </div>
  );
}

function Feedback({
  isCorrect,
  correctAnswer,
  explanation,
}: {
  isCorrect?: boolean;
  correctAnswer?: string;
  explanation?: string;
}) {
  return (
    <div className="space-y-2 mt-2">
      {!isCorrect && correctAnswer && (
        <div className="rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm">
          <span className="text-slate-500">Correct answer: </span>
          <span className="font-semibold text-slate-200">{correctAnswer}</span>
        </div>
      )}
      {explanation && (
        <div className="rounded-xl bg-brand-500/5 border border-brand-500/15 px-4 py-3 text-sm leading-relaxed text-slate-400">
          💡 {explanation}
        </div>
      )}
    </div>
  );
}

export const QuestionCard = Object.assign(QuestionCardRoot, { Feedback });
