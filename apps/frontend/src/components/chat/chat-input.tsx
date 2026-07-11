'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Message StudyMate...' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="relative flex w-full items-end gap-2 rounded-2xl bg-surface-2 border border-border/40 p-1.5 transition-all duration-300 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/20">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted/60 border-none outline-none focus:outline-none focus:ring-0 leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-surface-3"
        aria-label="Chat input"
      />

      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 mb-0.5 mr-0.5',
          value.trim() && !isLoading
            ? 'bg-foreground text-background hover:bg-foreground/90 active:scale-95'
            : 'bg-surface-2 text-muted cursor-not-allowed opacity-70',
        )}
        aria-label="Send message"
      >
        {isLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
        ) : (
          <FontAwesomeIcon icon={faArrowUp} className="w-[18px] h-[18px]" />
        )}
      </button>
    </div>
  );
}
