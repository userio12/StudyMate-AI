'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'brand-gradient text-white brand-glow hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] active:scale-[0.98]',
  secondary: 'bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.08)] text-slate-200 hover:bg-[rgba(255,255,255,0.11)] hover:border-[rgba(255,255,255,0.16)] hover:text-white active:scale-[0.98]',
  ghost:     'text-slate-400 hover:bg-[rgba(255,255,255,0.07)] hover:text-slate-200 active:bg-[rgba(255,255,255,0.11)]',
  outline:   'border border-[rgba(99,102,241,0.4)] text-brand-300 bg-brand-500/5 hover:bg-brand-500/10 hover:border-brand-500/60 active:scale-[0.98]',
  danger:    'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-300 hover:bg-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.5)] active:scale-[0.98]',
  success:   'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-emerald-300 hover:bg-[rgba(16,185,129,0.2)] active:scale-[0.98]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm:   'h-8  px-3 text-xs rounded-lg',
  md:   'h-9  px-4 text-sm rounded-xl',
  lg:   'h-11 px-6 text-sm rounded-xl',
  xl:   'h-12 px-7 text-base rounded-xl',
  icon: 'h-9 w-9 p-0 rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6366f1] focus-visible:outline-offset-2',
        'disabled:pointer-events-none disabled:opacity-40 select-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-[15px] h-[15px]" /> : children}
    </button>
  ),
);
Button.displayName = 'Button';
