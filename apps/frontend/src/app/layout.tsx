import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
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
  metadataBase: new URL('https://studymate-ai.vercel.app'),
  openGraph: {
    title: 'StudyMate AI',
    description: 'AI-powered study platform — chat with your documents, generate quizzes, collaborate in real-time.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyMate AI',
    description: 'AI-powered study platform',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#07080f" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f8faff" media="(prefers-color-scheme: light)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
