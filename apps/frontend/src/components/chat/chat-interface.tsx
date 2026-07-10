'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { PersonaBadge } from './persona-badge';
import { useApiClient } from '@/lib/api-client';
import { useRelationship } from '@/hooks/use-relationship';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faFileLines, faGraduationCap, faPenNib, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { useSearchPreference } from '@/hooks/use-search-preference';
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

const SUGGESTED_PROMPTS = [
  {
    icon: faFileLines,
    title: 'Summarize Document',
    prompt: 'Can you summarize the key points from my most recently uploaded document?',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/20 hover:border-brand-500/50 hover:bg-brand-500/20'
  },
  {
    icon: faLightbulb,
    title: 'Explain Concept',
    prompt: 'Explain the core concepts from my study materials as if I were a beginner.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/20'
  },
  {
    icon: faGraduationCap,
    title: 'Practice Questions',
    prompt: 'Generate 3 difficult practice questions based on the current context.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/20'
  },
  {
    icon: faPenNib,
    title: 'Brainstorm Ideas',
    prompt: 'Help me brainstorm some ideas for an upcoming essay based on my materials.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/20'
  }
];

export function ChatInterface({ conversationId, initialMessages, continuity }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { personaLabel, personaDescription, greeting, persona } = useRelationship(continuity);
  const { searchProvider } = useSearchPreference();

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
      { content, searchProvider },
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
  }, [conversationId, api, searchProvider]);

  if (messages.length === 0 && !error && !isStreaming) {
    return (
      <div className="flex h-full flex-col relative overflow-hidden bg-surface">
        {/* Animated Empty State Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none opacity-60" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none opacity-40" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 z-10 bg-surface/60 backdrop-blur-xl border-b border-white/5 sticky top-0">
          <PersonaBadge
            persona={persona}
            label={personaLabel}
            description={personaDescription}
          />
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-2/50 text-muted hover:text-foreground transition-colors border border-border/50">
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 relative z-10 w-full max-w-4xl mx-auto pb-10">
          
          {/* Glowing Orb Hero */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-violet-500 rounded-full blur-2xl opacity-40 animate-pulse" />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-brand-400 to-violet-600 p-[2px] shadow-[0_0_40px_rgba(99,102,241,0.5)]">
              <div className="h-full w-full rounded-full bg-surface-1 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500/20 to-violet-500/20 flex items-center justify-center">
                  <span className="text-3xl font-black bg-gradient-to-br from-brand-400 to-violet-400 bg-clip-text text-transparent">AI</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Greeting */}
          <h2 className="text-center text-3xl font-black tracking-tight text-foreground max-w-2xl leading-tight">
            {greeting}
          </h2>
          
          {continuity && continuity.weakAreas.length > 0 && (
            <div className="inline-flex items-center rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              Focus areas: {continuity.weakAreas.slice(0, 3).join(', ')}
            </div>
          )}

          {/* Suggested Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group ${item.bg}`}
              >
                <div className={`mt-0.5 ${item.color}`}>
                  <FontAwesomeIcon icon={item.icon} className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2 group-hover:text-muted-fg transition-colors">
                    {item.prompt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="mx-auto w-full max-w-4xl p-6 relative z-20">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col relative bg-surface">
      {/* Premium Sticky Header */}
      <div className="flex items-center justify-between px-6 py-4 z-30 bg-surface/70 backdrop-blur-xl border-b border-white/5 sticky top-0 shadow-sm">
        <PersonaBadge
          persona={persona}
          label={personaLabel}
          description={personaDescription}
        />
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-2/50 text-muted hover:text-foreground transition-colors border border-border/50">
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[180px] pt-4 relative z-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col space-y-6">
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
          <div className="glass rounded-2xl p-4 text-sm text-error/90 border border-error/20 flex justify-between items-center bg-error/5">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 transition-colors font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Enhanced Scrolling Fade & Input Container */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-32 pb-8 px-4 pointer-events-none">
        <div className="mx-auto w-full max-w-4xl pointer-events-auto">
          <ChatInput onSend={handleSend} isLoading={isStreaming} />
        </div>
      </div>
    </div>
  );
}
