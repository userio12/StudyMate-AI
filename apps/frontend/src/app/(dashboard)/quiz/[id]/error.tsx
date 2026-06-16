'use client';

export default function QuizError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="font-heading text-xl font-semibold text-navy-800 dark:text-parchment-100">
        Quiz error
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
        {error.message || 'Failed to load quiz.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-terracotta-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
      >
        Try again
      </button>
    </div>
  );
}
