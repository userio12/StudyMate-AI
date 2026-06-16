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
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SkipLink />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-ui text-sm',
            }}
          />
        </ThemeProvider>
      </SWRConfig>
    </ClerkProvider>
  );
}
