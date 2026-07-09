'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CitationBadge } from './citation-badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRobot } from '@fortawesome/free-solid-svg-icons';

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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <FontAwesomeIcon icon={faRobot} className="w-[18px] h-[18px]" />
        </div>
      )}

      <div className={cn('max-w-[75%]', isUser && 'order-first')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-500 text-white'
              : 'bg-surface-2 border border-border/50 text-foreground',
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

          {citations && citations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
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
            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-brand-500 dark:bg-brand-300" />
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground">
          <FontAwesomeIcon icon={faUser} className="w-[18px] h-[18px]" />
        </div>
      )}
    </div>
  );
});
