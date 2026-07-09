'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]',
  secondary: 'bg-surface-2 border border-border/50 text-foreground hover:bg-surface-hover hover:border-border-bright active:scale-[0.98]',
  ghost:     'text-muted-fg hover:bg-surface-hover hover:text-foreground active:bg-surface-2',
  outline:   'border border-brand-500/40 text-brand-400 bg-transparent hover:bg-brand-500/10 hover:border-brand-500/60 active:scale-[0.98]',
  danger:    'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98]',
  success:   'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 active:scale-[0.98]',
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
