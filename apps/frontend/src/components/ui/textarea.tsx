import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="label-caps text-muted-fg">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'glass min-h-[80px] w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/60 transition-shadow duration-200 resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
            error && 'ring-2 ring-error',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
