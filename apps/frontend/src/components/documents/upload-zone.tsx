'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCircleCheck, faCircleExclamation, faSpinner, faFileLines } from '@fortawesome/free-solid-svg-icons';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'success' | 'error';

export function UploadZone({
  onUpload,
  className,
}: {
  onUpload: (file: File, onProgress: (progress: number) => void) => void | Promise<void>;
  className?: string;
}) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    console.log(`[UploadZone] Starting upload for file: ${file.name} (size: ${file.size} bytes, type: ${file.type})`);
    if (file.type !== 'application/pdf') {
      console.error(`[UploadZone] Invalid file type: ${file.type}`);
      setState('error');
      setError('Only PDF files are supported');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      console.error(`[UploadZone] File too large: ${file.size} bytes`);
      setState('error');
      setError('File must be under 50 MB');
      return;
    }
    setFileName(file.name);
    setState('uploading');
    setProgress(0);
    try {
      console.log(`[UploadZone] Calling onUpload prop...`);
      await onUpload(file, (p) => {
        console.log(`[UploadZone] Upload progress: ${p}%`);
        setProgress(p);
        if (p === 100) {
          console.log(`[UploadZone] Upload reached 100%. Transitioning to processing state.`);
          setState('processing');
          // Fake progress for processing phase (goes from 0 to 95)
          setProgress(0);
        }
      });
      console.log(`[UploadZone] Upload and initial processing initiated successfully.`);
      setState('success');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      console.error(`[UploadZone] Upload failed with error:`, err);
      setState('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === 'processing') {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Auto-reset to idle after success/error so user can upload another file
  // and focus shifts to the DocumentCard's real-time progress tracking
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (state === 'success' || state === 'error') {
      timeout = setTimeout(() => {
        setState('idle');
        setProgress(0);
        setError(undefined);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [state]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState('dragging');
  };

  const handleDragLeave = () => {
    setState('idle');
  };

  const isDragging = state === 'dragging';
  const isIdle = state === 'idle';
  const isActive = isIdle || isDragging;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => isActive && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isActive) inputRef.current?.click();
        }}
        aria-label="Upload PDF file"
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl p-10',
          'min-h-[220px] border-2 border-dashed transition-all duration-300',
          isIdle &&
            'border-border bg-surface-1 hover:border-brand-500/50 hover:bg-brand-500/5 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]',
          isDragging &&
            'border-brand-500 bg-brand-500/10 shadow-[0_0_30px_rgba(99,102,241,0.25)] scale-[1.01]',
          !isActive && 'pointer-events-none opacity-60 cursor-default',
        )}
      >
        {/* Animated grid pattern */}
        {isIdle && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}

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

        <UploadStateContent state={state} progress={progress} fileName={fileName} error={error} />
      </div>
    </div>
  );
}

function UploadStateContent({ state, progress, fileName, error }: { state: UploadState; progress?: number; fileName?: string; error?: string }) {
  switch (state) {
    case 'idle':
      return (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 transition-transform duration-300 hover:scale-110">
            <FontAwesomeIcon icon={faUpload} className="text-brand-300 w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-slate-200">
            Drop your PDF here
          </p>
          <p className="mt-1.5 text-sm text-slate-500">or click to browse files</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-12 bg-border" />
            <span className="label-caps text-slate-700">PDF only · max 50 MB</span>
            <span className="h-px w-12 bg-border" />
          </div>
        </>
      );
    case 'dragging':
      return (
        <>
          <div className="mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-brand-500/20">
            <FontAwesomeIcon icon={faUpload} className="text-brand-300 w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-brand-300">Release to upload</p>
        </>
      );
    case 'uploading':
    case 'processing':
      return (
        <div className="flex w-full max-w-[240px] flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10">
            <FontAwesomeIcon icon={faUpload} className="text-brand-300 w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-slate-200 mb-3">
            {state === 'uploading' ? 'Uploading' : 'Processing'} PDF...
          </p>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${state === 'processing' ? 100 : Math.max(5, progress || 0)}%` }}
            />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <FontAwesomeIcon icon={faFileLines} className="w-3 h-3" /> {fileName}
          </p>
        </div>
      );
    case 'success':
      return (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-300 w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-emerald-300">Uploaded successfully!</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <FontAwesomeIcon icon={faFileLines} className="w-[13px] h-[13px]" /> {fileName}
          </p>
        </>
      );
    case 'error':
      return (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-dim">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-red-300 w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-red-300">{error}</p>
          <p className="mt-1 text-sm text-slate-500">Click to try again</p>
        </>
      );
  }
}
