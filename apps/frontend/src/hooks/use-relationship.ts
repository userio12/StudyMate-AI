'use client';

import { useMemo } from 'react';
import { useTrustLevel } from './use-trust-level';
import { PERSONA_LABELS, PERSONA_DESCRIPTIONS } from '@studymate/shared';
import type { ContinuityContext, Persona } from '@studymate/shared';

interface RelationshipResult {
  greeting: string;
  persona: Persona;
  personaLabel: string;
  personaDescription: string;
  showOnboarding: boolean;
  adaptiveDifficulty: boolean;
  continuity: ContinuityContext | null;
}

export function useRelationship(
  continuity?: ContinuityContext | null,
): RelationshipResult {
  const { trustLevel, persona, showOnboarding } = useTrustLevel();

  return useMemo(() => {
    const personaLabel = PERSONA_LABELS[persona];
    const personaDescription = PERSONA_DESCRIPTIONS[persona];

    let greeting: string;

    if (continuity) {
      greeting = `Welcome back! You were studying ${continuity.suggestedTopic}.`;
    } else if (trustLevel === 'stranger') {
      greeting = 'Upload a PDF to get started.';
    } else {
      greeting = 'Ask anything about your course material.';
    }

    return {
      greeting,
      persona,
      personaLabel,
      personaDescription,
      showOnboarding,
      adaptiveDifficulty: !showOnboarding,
      continuity: continuity ?? null,
    };
  }, [trustLevel, persona, showOnboarding, continuity]);
}
