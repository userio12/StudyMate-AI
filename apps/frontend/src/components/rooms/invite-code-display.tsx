'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg bg-parchment-200 px-3 py-1.5 text-sm font-mono font-medium text-navy-800 transition-colors hover:bg-parchment-300 dark:bg-navy-700 dark:text-parchment-200 dark:hover:bg-navy-600"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {code}
    </button>
  );
}
