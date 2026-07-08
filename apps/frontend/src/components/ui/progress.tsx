import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('h-2 w-full overflow-hidden rounded-full bg-white/30 dark:bg-white/5', className)}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress };
