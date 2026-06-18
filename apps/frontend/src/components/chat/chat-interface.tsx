'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { PersonaBadge } from './persona-badge';
import { useApiClient } from '@/lib/api-client';
import { useRelationship } from '@/hooks/use-relationship';
import { MessageSquare, Sparkles } from 'lucide-react';
import type { ContinuityContext, Persona } from '@studymate/shared';

interface Citation {
  chunkId: string;
  documentTitle: string;
  snippet: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages?: Message[];
  continuity?: ContinuityContext | null;
}

export function ChatInterface({ conversationId, initialMessages, continuity }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { personaLabel, personaDescription, greeting, persona } = useRelationship(continuity);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = useCallback(async (content: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setStreamingContent('');
    setIsStreaming(true);
    setError(null);
    
    let currentStream = '';

    await api.streamPost(
      `/chat/conversations/${conversationId}/message`,
      { content },
      (token) => {
        currentStream += token;
        setStreamingContent(currentStream);
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: currentStream },
        ]);
        setStreamingContent('');
        setIsStreaming(false);
        abortRef.current = null;
      },
      (err) => {
        setError(err.message);
        setIsStreaming(false);
        abortRef.current = null;
      },
      controller.signal,
    );
  }, [conversationId, api]);

  if (messages.length === 0 && !error && !isStreaming) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <div className="studymate-glow rounded-full p-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <p className="text-center text-base leading-relaxed font-medium text-navy-800 dark:text-parchment-100">
            {greeting}
          </p>
          {continuity && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {continuity.weakAreas.length > 0 && (
                <p className="text-center text-xs leading-relaxed text-navy-500 dark:text-parchment-400">
                  Weak areas: {continuity.weakAreas.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          )}
          <PersonaBadge
            persona={persona}
            label={personaLabel}
            description={personaDescription}
          />
        </div>
        <div className="p-4">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-parchment-300 px-4 py-3 dark:border-navy-700">
        <PersonaBadge
          persona={persona}
          label={personaLabel}
          description={personaDescription}
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            citations={msg.citations}
          />
        ))}
        
        {isStreaming && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-parchment-300 p-4 dark:border-navy-700">
        <ChatInput onSend={handleSend} isLoading={isStreaming} />
      </div>
    </div>
  );
}
