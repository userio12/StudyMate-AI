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

  // Find the longest word to use as an invisible spacer to maintain consistent width
  const longestWord = [...words].sort((a, b) => b.length - a.length)[0];

  return (
    <span className={cn("relative inline-block overflow-hidden align-top", className)}>
      {words.map((word, i) => {
        const isActive = i === index;
        const isPrev = i === (index - 1 + words.length) % words.length;
        
        return (
          <span
            key={word}
            className={cn(
              "absolute left-0 top-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
      {/* Invisible spacer dictates the width and height of the container */}
      <span className="invisible whitespace-nowrap block pointer-events-none h-auto">
        {longestWord}
      </span>
    </span>
  );
}
