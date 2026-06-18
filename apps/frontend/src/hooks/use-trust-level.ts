'use client';

import { useUser } from '@clerk/nextjs';
import { useMemo, useState, useEffect } from 'react';
import type { TrustLevel as TrustLevelType, Persona } from '@studymate/shared';
import { SESSION_COUNT_THRESHOLDS, TRUST_DECAY_DAYS } from '@studymate/shared';

const STORAGE_KEY = 'studymate-trust';

interface TrustStorage {
  lastActiveAt: string;
}

function getLastActive(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: TrustStorage = JSON.parse(raw);
    return data.lastActiveAt ?? null;
  } catch {
    return null;
  }
}

function persistActivity() {
  if (typeof window === 'undefined') return;
  try {
    const data: TrustStorage = { lastActiveAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
}

function computeTrustLevel(sessionCount: number, lastActiveAt: string | null): {
  trustLevel: TrustLevelType;
  persona: Persona;
} {
  let baseLevel: TrustLevelType = 'stranger';

  const sorted = Object.entries(SESSION_COUNT_THRESHOLDS).sort(
    (a, b) => (b[1] as any).min - (a[1] as any).min,
  );

  for (const [level, config] of sorted) {
    if (sessionCount >= (config as any).min) {
      baseLevel = level as TrustLevelType;
      break;
    }
  }

  let effectiveLevel: TrustLevelType = baseLevel;

  if (lastActiveAt && baseLevel !== 'stranger') {
    const lastActive = new Date(lastActiveAt).getTime();
    const now = Date.now();
    const daysSince = (now - lastActive) / (1000 * 60 * 60 * 24);

    if (daysSince > TRUST_DECAY_DAYS * 2) {
      effectiveLevel = 'stranger';
    } else if (daysSince > TRUST_DECAY_DAYS) {
      const levels: TrustLevelType[] = ['stranger', 'acquaintance', 'friend', 'study_partner', 'mentor'];
      const currentIndex = levels.indexOf(baseLevel);
      if (currentIndex > 0) {
        effectiveLevel = levels[currentIndex - 1]!;
      }
    }
  }

  const persona = (SESSION_COUNT_THRESHOLDS as any)[effectiveLevel].persona;

  return { trustLevel: effectiveLevel, persona };
}

export function useTrustLevel() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useMemo(() => {
    const sessionCount = (user?.publicMetadata?.sessionCount as number) ?? 0;
    // During hydration/SSR, assume no lastActiveAt to match server
    const lastActiveAt = mounted ? getLastActive() : null;

    const { trustLevel, persona } = computeTrustLevel(sessionCount, lastActiveAt);

    const showOnboarding = trustLevel === 'stranger' || trustLevel === 'acquaintance';
    const showAdvancedFeatures = trustLevel !== 'stranger';
    const showBetaFeatures = trustLevel === 'mentor';

    return {
      sessionCount,
      trustLevel,
      persona,
      showOnboarding,
      showAdvancedFeatures,
      showBetaFeatures,
      persistActivity,
    } as const;
  }, [user, mounted]);
}
