'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

export function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-1 border border-border p-3">
      <div className="flex-1 min-w-0">
        <p className="label-caps text-slate-600 mb-1">Invite Code</p>
        <p className="font-mono text-lg font-bold tracking-widest text-slate-100 select-all">{code}</p>
      </div>
      <button type="button"
        onClick={handleCopy}
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
          copied
            ? 'bg-success/15 text-emerald-300 border border-success/30'
            : 'bg-surface-2 border border-border text-slate-500 hover:bg-surface-3 hover:text-slate-300 hover:border-border-bright',
        ].join(' ')}
        aria-label={copied ? 'Copied!' : 'Copy invite code'}
      >
        {copied ? <FontAwesomeIcon icon={faCheck} className="w-[15px] h-[15px]" /> : <FontAwesomeIcon icon={faCopy} className="w-[15px] h-[15px]" />}
      </button>
    </div>
  );
}
