'use client';

import { useEffect, useRef, useState } from 'react';

interface ScoreCircleProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function ScoreCircle({ score, size = 120, showLabel = true }: ScoreCircleProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const offset = animated
    ? circumference - (score / 100) * circumference
    : circumference;

  const isGood = score >= 80;
  const isOk = score >= 50;

  // Brand gradient for good, amber for ok, red for poor
  const gradientId = `score-grad-${score}`;
  const trackColor = 'rgba(255,255,255,0.06)';

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 absolute inset-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {isGood ? (
              <>
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </>
            ) : isOk ? (
              <>
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </>
            )}
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
        />
      </svg>

      {showLabel && (
        <div className="relative flex flex-col items-center">
          <span className={`text-2xl font-extrabold ${isGood ? 'gradient-text-brand' : isOk ? 'text-amber-300' : 'text-red-400'}`}>
            {score}%
          </span>
          <span className="text-xs text-slate-600 mt-0.5">
            {isGood ? 'Excellent' : isOk ? 'Good' : 'Needs work'}
          </span>
        </div>
      )}
    </div>
  );
}
