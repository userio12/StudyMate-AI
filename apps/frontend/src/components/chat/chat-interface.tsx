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
import { useAiModelPreferences } from '@/hooks/use-ai-models';
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
  conversationId?: string;
  initialMessages?: Message[];
  continuity?: ContinuityContext | null;
  onConversationCreated?: (id: string) => void;
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

export function ChatInterface({ conversationId, initialMessages, continuity, onConversationCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { personaLabel, personaDescription, greeting, persona } = useRelationship(continuity);
  const { searchProvider } = useSearchPreference();
  const { chatProvider, openRouterChatModel } = useAiModelPreferences();

  useEffect(() => {
    let animationFrameId: number;
    const container = scrollContainerRef.current;

    const smoothScroll = () => {
      if (!container) return;
      const targetScrollTop = container.scrollHeight - container.clientHeight;
      const distance = targetScrollTop - container.scrollTop;
      
      if (distance > 1) {
        container.scrollTop += distance * 0.15; 
        animationFrameId = requestAnimationFrame(smoothScroll);
      } else {
        container.scrollTop = targetScrollTop;
      }
    };

    if (isStreaming) {
      animationFrameId = requestAnimationFrame(smoothScroll);
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [messages, streamingContent, isStreaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = async (content: string) => {
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
    
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      try {
        const { id } = await api.post<{ id: string; title: string }>('/chat/conversations', {
          title: 'New conversation',
        });
        activeConversationId = id;
        onConversationCreated?.(id);
      } catch (err: any) {
        setError(err.message || 'Failed to create conversation');
        setIsStreaming(false);
        abortRef.current = null;
        return;
      }
    }
    
    let currentStream = '';
    let lastRenderTime = 0;

    await api.streamPost(
      `/chat/conversations/${activeConversationId}/message`,
      { content, searchProvider, chatProvider, chatModel: openRouterChatModel },
      (token) => {
        currentStream += token;
        const now = Date.now();
        if (now - lastRenderTime > 35) {
          setStreamingContent(currentStream);
          lastRenderTime = now;
        }
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
    );
  };

  if (messages.length === 0 && !error && !isStreaming) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-background">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 z-10 bg-surface/60 backdrop-blur-xl border-b border-white/5">
          <PersonaBadge
            persona={persona}
            label={personaLabel}
            description={personaDescription}
          />
          <button aria-label="Action" type="button" className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-2/50 text-muted hover:text-foreground transition-colors border border-border/50">
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 relative z-10 w-full max-w-3xl mx-auto pb-10">
          
          {/* Clean Logo Hero */}
          <div className="relative flex items-center justify-center mb-2">
            <div className="h-16 px-6 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center shadow-sm">
              <span className="text-2xl font-black bg-gradient-to-br from-brand-400 to-violet-400 bg-clip-text text-transparent">StudyMate AI</span>
            </div>
          </div>
          
          {/* Greeting */}
          <h2 className="text-center text-2xl md:text-3xl font-black tracking-tight text-foreground max-w-2xl leading-tight">
            {greeting}
          </h2>
          
          {continuity && continuity.weakAreas.length > 0 && (
            <div className="inline-flex items-center rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20">
              Focus areas: {continuity.weakAreas.slice(0, 3).join(', ')}
            </div>
          )}

          {/* Suggested Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button type="button"
                key={item.title}
                onClick={() => handleSend(item.prompt)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300 text-left group ${item.bg}`}
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
        <div className="mx-auto w-full max-w-3xl p-4 md:p-6 relative z-20">
          <ChatInput onSend={handleSend} isLoading={isStreaming} onStop={() => abortRef.current?.abort()} />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-background">
      {/* Premium Sticky Header */}
      <div className="flex items-center justify-between px-6 py-4 z-30 bg-surface/70 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <PersonaBadge
          persona={persona}
          label={personaLabel}
          description={personaDescription}
        />
        <button aria-label="Action" type="button" className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-2/50 text-muted hover:text-foreground transition-colors border border-border/50">
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-[280px] pt-4 relative z-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-6">
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
            <button type="button"
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
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-32 pb-8 px-4 pointer-events-none">
        <div className="mx-auto w-full max-w-3xl pointer-events-auto">
          <ChatInput onSend={handleSend} isLoading={isStreaming} onStop={() => abortRef.current?.abort()} />
        </div>
      </div>
    </div>
  );
}
