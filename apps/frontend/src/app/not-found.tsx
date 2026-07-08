import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="font-heading text-4xl font-bold text-ink-600 dark:text-cream-100">
        404
      </h1>
      <p className="mt-2 text-lg text-ink-400 dark:text-ink-200">
        Page not found
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-600 active:bg-brand-700"
      >
        Go home
      </Link>
    </div>
  );
}
