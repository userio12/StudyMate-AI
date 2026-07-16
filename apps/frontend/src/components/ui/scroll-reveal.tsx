'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

const observerMap = new Map<number, IntersectionObserver>();
const callbacks = new WeakMap<Element, () => void>();

function getObserver(threshold: number) {
  if (typeof window === 'undefined') return null;
  if (!observerMap.has(threshold)) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) cb();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    observerMap.set(threshold, observer);
  }
  return observerMap.get(threshold);
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    const observer = getObserver(threshold);
    
    callbacks.set(element, () => setIsVisible(true));
    observer?.observe(element);
    
    return () => {
      observer?.unobserve(element);
      callbacks.delete(element);
    };
  }, [threshold]);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 scale-100';
    switch (direction) {
      case 'up':
        return 'translate-y-8';
      case 'down':
        return '-translate-y-8';
      case 'left':
        return 'translate-x-8';
      case 'right':
        return '-translate-x-8';
      case 'none':
        return 'scale-95';
      default:
        return 'translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-[opacity,transform]',
        isVisible ? 'opacity-100' : 'opacity-0',
        getTransform(),
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
