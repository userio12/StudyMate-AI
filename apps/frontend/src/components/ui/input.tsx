import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl px-3.5 py-2 text-sm',
        'bg-surface-1 border border-border text-slate-200 placeholder:text-slate-600',
        'transition-all duration-200',
        'hover:border-border-bright',
        'focus:border-brand-500/60 focus:bg-surface-2 focus:ring-2 focus:ring-brand-500/20 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'read-only:opacity-70',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
