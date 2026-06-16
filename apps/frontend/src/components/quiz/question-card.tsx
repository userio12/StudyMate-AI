'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

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
}: {
  children?: ReactNode;
  questionId: string;
  question: string;
  questionType: string;
  options?: string[];
  onAnswer: (questionId: string, answer: string) => void;
  showResult?: boolean;
  showExplanation?: boolean;
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

  return (
    <div className="rounded-xl border border-parchment-300 bg-parchment-50 p-5 dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-start gap-2">
        <HelpCircle size={18} className="mt-0.5 shrink-0 text-terracotta-500" />
        <div>
          <p className="text-sm leading-relaxed font-medium text-navy-800 dark:text-parchment-100">
            {question}
          </p>
          <span className="mt-1 inline-block text-xs text-navy-500 dark:text-parchment-500">
            {questionType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {options && (
        <div className="mt-3 space-y-2">
          {options.map((option, i) => {
            const isSelected = selected === option;
            const optionLabel = String.fromCharCode(65 + i);

            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors',
                  'min-h-[44px]',
                  isSelected
                    ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 dark:bg-navy-700 dark:text-terracotta-300'
                    : 'border-parchment-300 text-navy-700 hover:bg-parchment-100 dark:border-navy-600 dark:text-parchment-300 dark:hover:bg-navy-700',
                )}
                disabled={submitted}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-medium">
                  {optionLabel}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      {questionType === 'short_answer' && (
        <div className="mt-3">
          <textarea
            value={selected ?? ''}
            onChange={(e) => handleSelect(e.target.value)}
            placeholder="Type your answer..."
            aria-label="Your answer"
            disabled={submitted}
            rows={2}
            className="w-full resize-none rounded-lg border border-parchment-300 bg-white p-3 text-sm text-navy-800 placeholder:text-navy-400 focus:border-terracotta-500 focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-parchment-100"
          />
        </div>
      )}

      {!submitted && selected && (
        <button
          onClick={handleSubmit}
          className="mt-3 rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
        >
          Submit answer
        </button>
      )}

      {children}

      {submitted && showExplanation && selected && (
        <div className="mt-3">
          {showResult !== false ? (
            <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 size={16} className="mt-0.5" />
              <span>Correct!</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <XCircle size={16} className="mt-0.5" />
              <span>Incorrect</span>
            </div>
          )}
        </div>
      )}
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
    <div className="mt-3 space-y-2">
      {!isCorrect && correctAnswer && (
        <p className="text-sm text-navy-700 dark:text-parchment-300">
          Correct answer: <span className="font-medium">{correctAnswer}</span>
        </p>
      )}
      {explanation && (
        <p className="text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
          {explanation}
        </p>
      )}
    </div>
  );
}

export const QuestionCard = Object.assign(QuestionCardRoot, {
  Feedback,
});
