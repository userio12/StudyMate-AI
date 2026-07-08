'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SWRConfig } from 'swr';
import { type ReactNode } from 'react';
import { SkipLink } from './skip-link';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <SWRConfig
        value={{
          onError: (error) => {
            toast.error(handleApiError(error));
          },
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          <SkipLink />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'text-sm',
              style: {
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.8)',
                borderRadius: '12px',
                color: '#1a1a2e',
              },
            }}
          />
        </ThemeProvider>
      </SWRConfig>
    </ClerkProvider>
  );
}
