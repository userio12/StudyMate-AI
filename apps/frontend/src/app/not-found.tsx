import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="font-heading text-4xl font-semibold text-navy-800 dark:text-parchment-100">
        404
      </h1>
      <p className="mt-2 text-lg leading-relaxed text-navy-600 dark:text-parchment-400">
        Page not found
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-terracotta-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
      >
        Go home
      </Link>
    </div>
  );
}
