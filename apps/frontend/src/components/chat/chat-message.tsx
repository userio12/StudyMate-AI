'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

export function ChatMessage({ role, content, citations, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3 animate-message-appear', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <FontAwesomeIcon icon={faRobot} className="w-[18px] h-[18px]" />
        </div>
      )}

      <div className={cn('max-w-[75%]', isUser && 'order-first')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm',
            isUser
              ? 'bg-brand-500 text-white'
              : 'bg-surface-2 border border-border/40 text-foreground',
          )}
        >
          {isStreaming && !content ? (
            <div className="flex items-center gap-1.5 h-6 px-1">
              <span className="h-2 w-2 rounded-full bg-brand-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-brand-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-brand-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className={cn(
              "prose prose-sm max-w-none break-words",
              isUser ? "prose-p:text-white prose-a:text-white prose-strong:text-white prose-ul:text-white prose-li:text-white text-white" : "dark:prose-invert prose-p:leading-relaxed"
            )}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}

          {isStreaming && content && (
            <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-brand-500 dark:bg-brand-300 align-middle" />
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
}
