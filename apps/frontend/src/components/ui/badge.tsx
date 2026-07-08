import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default' | 'brand' | 'violet' | 'cyan'
  | 'success' | 'warning' | 'error'
  | 'pending' | 'processing' | 'ready'
  | 'beginner' | 'intermediate' | 'advanced';

const variantClasses: Record<BadgeVariant, string> = {
  default:      'bg-[rgba(255,255,255,0.07)] text-slate-300',
  brand:        'bg-[rgba(99,102,241,0.15)] text-[#a5b4fc] border border-[rgba(99,102,241,0.3)]',
  violet:       'bg-[rgba(168,85,247,0.15)] text-[#c084fc] border border-[rgba(168,85,247,0.3)]',
  cyan:         'bg-[rgba(6,182,212,0.15)] text-[#67e8f9] border border-[rgba(6,182,212,0.3)]',
  success:      'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7] border border-[rgba(16,185,129,0.3)]',
  warning:      'bg-[rgba(245,158,11,0.15)] text-[#fcd34d] border border-[rgba(245,158,11,0.3)]',
  error:        'bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border border-[rgba(239,68,68,0.3)]',
  // Status
  pending:      'bg-[rgba(245,158,11,0.15)] text-[#fcd34d] border border-[rgba(245,158,11,0.3)]',
  processing:   'bg-[rgba(99,102,241,0.15)] text-[#a5b4fc] border border-[rgba(99,102,241,0.3)]',
  ready:        'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7] border border-[rgba(16,185,129,0.3)]',
  // Difficulty
  beginner:     'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7] border border-[rgba(16,185,129,0.3)]',
  intermediate: 'bg-[rgba(245,158,11,0.15)] text-[#fcd34d] border border-[rgba(245,158,11,0.3)]',
  advanced:     'bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border border-[rgba(239,68,68,0.3)]',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
