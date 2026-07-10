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
    <div className="relative flex w-full items-end gap-3 rounded-3xl bg-surface-1 border border-border/60 p-2 shadow-sm transition-all duration-300 focus-within:border-border focus-within:shadow-md">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted/60 border-none outline-none focus:outline-none focus:ring-0 leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-surface-3"
        aria-label="Chat input"
      />

      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 mb-0.5 mr-0.5',
          value.trim() && !isLoading
            ? 'bg-foreground text-surface hover:scale-105 active:scale-95 shadow-sm'
            : 'bg-surface-2 text-muted cursor-not-allowed opacity-70',
        )}
        aria-label="Send message"
      >
        {isLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
        ) : (
          <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
