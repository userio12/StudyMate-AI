'use client';

import { Badge } from '../ui/badge';

const difficultyMap = {
  beginner:     { variant: 'beginner'     as const, label: '● Beginner' },
  intermediate: { variant: 'intermediate' as const, label: '◆ Intermediate' },
  advanced:     { variant: 'advanced'     as const, label: '▲ Advanced' },
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cfg = difficultyMap[difficulty as keyof typeof difficultyMap] ?? difficultyMap.beginner;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
