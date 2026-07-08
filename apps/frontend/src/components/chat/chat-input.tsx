'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Ask a question...' }: ChatInputProps) {
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
    <div className="glass flex items-end gap-2 rounded-2xl p-3 transition-all duration-200 focus-within:shadow-glow focus-within:ring-2 focus-within:ring-brand-500/50 border border-transparent focus-within:border-brand-500">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted/50 border-none outline-none focus:outline-none focus:ring-0"
        aria-label="Chat input"
      />

      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
          value.trim() && !isLoading
            ? 'bg-brand-500 text-white shadow-sm hover:bg-brand-600'
            : 'bg-surface-2 text-muted cursor-not-allowed',
        )}
        aria-label="Send message"
      >
        {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> : <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />}
      </button>
    </div>
  );
}
