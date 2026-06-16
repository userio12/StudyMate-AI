'use client';

import { useState, useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'success' | 'error';

function UploadZoneRoot({
  children,
  onUpload,
  className,
}: {
  children: ReactNode;
  onUpload: (file: File) => void | Promise<void>;
  className?: string;
}) {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf') {
        setState('error');
        setError('Only PDF files are supported');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setState('error');
        setError('File must be under 50 MB');
        return;
      }
      setFileName(file.name);
      setState('uploading');
      try {
        await onUpload(file);
        setState('success');
        if (inputRef.current) inputRef.current.value = '';
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState('idle');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('dragging');
  }, []);

  const handleDragLeave = useCallback(() => {
    setState('idle');
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        aria-label="Upload PDF file"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          'min-h-[200px]',
          state === 'dragging' && 'border-terracotta-500 bg-terracotta-50 dark:bg-navy-700',
          state === 'idle' && 'border-parchment-400 hover:border-terracotta-400 hover:bg-parchment-50 dark:border-navy-600 dark:hover:bg-navy-800',
          state !== 'idle' && state !== 'dragging' && 'pointer-events-none border-parchment-300 dark:border-navy-700',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <UploadStateContent state={state} fileName={fileName} error={error} />
      </div>
      {children}
    </div>
  );
}

function UploadStateContent({ state, fileName, error }: { state: UploadState; fileName?: string; error?: string }) {
  switch (state) {
    case 'idle':
      return (
        <>
          <Upload size={32} className="text-parchment-400" />
          <p className="mt-3 text-sm font-medium text-navy-600 dark:text-parchment-300">
            Drop your PDF here or click to browse
          </p>
          <p className="mt-1 text-xs text-navy-500 dark:text-parchment-400">
            Maximum file size: 50 MB
          </p>
        </>
      );
    case 'dragging':
      return (
        <>
          <Upload size={32} className="text-terracotta-500" />
          <p className="mt-3 text-sm font-medium text-terracotta-600">
            Drop to upload
          </p>
        </>
      );
    case 'uploading':
      return (
        <>
          <Loader2 size={32} className="animate-spin text-terracotta-500" />
          <p className="mt-3 text-sm font-medium text-navy-600 dark:text-parchment-300">
            Uploading {fileName}...
          </p>
        </>
      );
    case 'processing':
      return (
        <>
          <Loader2 size={32} className="animate-spin text-terracotta-500" />
          <p className="mt-3 text-sm font-medium text-navy-600 dark:text-parchment-300">
            Processing {fileName}...
          </p>
        </>
      );
    case 'success':
      return (
        <>
          <CheckCircle2 size={32} className="text-green-500" />
          <p className="mt-3 text-sm font-medium text-green-600">
            {fileName} uploaded successfully
          </p>
        </>
      );
    case 'error':
      return (
        <>
          <AlertCircle size={32} className="text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        </>
      );
  }
}

export const UploadZone = Object.assign(UploadZoneRoot, {});
