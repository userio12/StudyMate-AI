'use client';

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="glass-card mx-auto my-12 flex max-w-md flex-col items-center p-8 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink-600 dark:text-cream-100">
        Authentication error
      </h1>
      <p className="mt-2 text-sm text-ink-400 dark:text-ink-200">
        {error.message || 'Something went wrong. Please try again.'}
      </p>
      <button type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-600 active:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
