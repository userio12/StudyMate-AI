'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CitationBadge } from './citation-badge';
import { User, Bot } from 'lucide-react';

interface Citation {
  chunkId: string;
  documentTitle: string;
  snippet: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

export const ChatMessage = React.memo(function ChatMessage({ role, content, citations, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-600 dark:bg-navy-700 dark:text-terracotta-400">
          <Bot size={18} />
        </div>
      )}

      <div className={cn('max-w-[75%]', isUser && 'order-first')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-terracotta-500 text-white'
              : 'bg-parchment-200 text-navy-800 dark:bg-navy-700 dark:text-parchment-100',
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

          {citations && citations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-parchment-300 pt-2 dark:border-navy-600">
              {citations.map((c, i) => (
                <CitationBadge
                  key={c.chunkId}
                  number={i + 1}
                  title={c.documentTitle}
                  snippet={c.snippet}
                />
              ))}
            </div>
          )}

          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-current" />
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-600 dark:bg-navy-700 dark:text-parchment-300">
          <User size={18} />
        </div>
      )}
    </div>
  );
});
