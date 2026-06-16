import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment-100 p-6 dark:bg-navy-900">
      <div className="w-full max-w-sm rounded-xl border border-parchment-300 bg-white p-8 shadow-warm dark:border-navy-700 dark:bg-navy-800">
        {children}
      </div>
    </div>
  );
}
