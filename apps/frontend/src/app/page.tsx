import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-parchment-300 px-6 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <div className="studymate-glow h-6 w-6 rounded-full" />
          <span className="font-heading text-lg font-semibold text-navy-800 dark:text-parchment-100">
            StudyMate
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-navy-600 hover:text-navy-800 dark:text-parchment-300"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="studymate-glow mx-auto mb-8 h-16 w-16 rounded-2xl" />

          <h1 className="font-heading text-4xl font-semibold leading-tight text-navy-800 dark:text-parchment-100 md:text-5xl">
            Study smarter
            <br />
            <span className="text-terracotta-500">with AI</span>
          </h1>

          <p className="prose mx-auto mt-4 text-lg leading-relaxed text-navy-600 dark:text-parchment-300">
            Upload your PDFs, chat with your materials, and generate adaptive quizzes.
            Your AI-powered study companion.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-terracotta-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
            >
              Start studying
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-parchment-300 px-6 py-3 text-sm font-medium text-navy-600 transition-colors hover:bg-parchment-100 dark:border-navy-600 dark:text-parchment-300"
            >
              Sign in
            </Link>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="sr-only">Features</h2>
          <div className="grid gap-6 sm:grid-cols-3">
          {[
            { title: 'Upload PDFs', desc: 'Drag and drop your study materials. We extract and index every page.' },
            { title: 'Chat & Ask', desc: 'Ask questions about your documents. Get answers with source citations.' },
            { title: 'Adaptive Quizzes', desc: 'Generate quizzes from your notes. Focus on weak areas automatically.' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-parchment-300 bg-parchment-50 p-6 text-left dark:border-navy-700 dark:bg-navy-800"
            >
              <h3 className="font-heading text-lg font-semibold text-navy-800 dark:text-parchment-100">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-parchment-300">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
        </section>
      </main>
    </div>
  );
}
