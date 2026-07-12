'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WordRotatorProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function WordRotator({ words, interval = 3000, className }: WordRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  return (
    <span className={cn("inline-grid overflow-hidden py-2 -my-2", className)}>
      {words.map((word, i) => {
        const isActive = i === index;
        const isPrev = i === (index - 1 + words.length) % words.length;
        
        return (
          <span
            key={word}
            className={cn(
              "col-start-1 row-start-1 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isActive 
                ? "translate-y-0 opacity-100" 
                : isPrev 
                  ? "translate-y-full opacity-0" // Slide down to exit
                  : "-translate-y-full opacity-0" // Staged above to enter (slide down)
            )}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
