import type { Metadata } from 'next';
import { Fraunces, Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'StudyMate AI',
    template: '%s | StudyMate AI',
  },
  description: 'Your AI-powered study companion — upload PDFs, chat with citations, and generate adaptive quizzes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#fcfaf8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1f36" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className={`${fraunces.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      >
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
