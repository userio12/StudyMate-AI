'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

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
    <div className="flex items-end gap-2 rounded-2xl border border-parchment-300 bg-parchment-50 p-3 focus-within:border-terracotta-500 dark:border-navy-700 dark:bg-navy-800">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none dark:text-parchment-100 dark:placeholder:text-parchment-500"
        aria-label="Chat input"
      />

      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
          value.trim() && !isLoading
            ? 'bg-terracotta-500 text-white hover:bg-terracotta-600'
            : 'bg-parchment-200 text-navy-400 dark:bg-navy-700 dark:text-parchment-500',
        )}
        aria-label="Send message"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </div>
  );
}
