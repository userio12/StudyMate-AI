'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export function Dialog({
  open,
  onOpenChange,
  children,
  position = 'center',
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  position?: 'center' | 'right';
  className?: string;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (open) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange(false);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onOpenChange]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onOpenChange(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        'glass-card z-50 p-6 shadow-lg backdrop:bg-black/30 backdrop:backdrop-blur-sm transition-all',
        position === 'center' && 'relative w-full max-w-md rounded-2xl m-auto',
        position === 'right' && 'fixed right-0 left-auto top-0 bottom-0 m-0 h-full w-full max-w-md rounded-none rounded-l-2xl animate-in slide-in-from-right duration-300',
        className
      )}
      aria-label="Dialog"
    >
      <button type="button"
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-surface-hover hover:text-foreground"
        aria-label="Close dialog"
      >
        <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
      </button>
      {children}
    </dialog>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mb-4 pr-8', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className={cn('font-heading text-lg font-bold', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn('mt-1 text-sm text-muted-fg', className)}>
      {children}
    </p>
  );
}
