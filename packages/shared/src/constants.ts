export const EMBEDDING_MODEL = 'text-embedding-004' as const;
export const CHAT_MODEL = 'gemini-2.0-flash' as const;
export const EMBEDDING_DIMENSIONS = 768 as const;
export const MAX_CHUNK_LENGTH = 1024 as const;
export const CHUNK_OVERLAP = 128 as const;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const ALLOWED_MIME_TYPES = ['application/pdf'] as const;
export const DEFAULT_QUIZ_QUESTION_COUNT = 5 as const;
export const MAX_CONVERSATION_TITLE_LENGTH = 300 as const;

// ── Trust & Persona ──────────────────────────────────────
export const TrustLevel = {
  STRANGER: 'stranger',
  ACQUAINTANCE: 'acquaintance',
  FRIEND: 'friend',
  STUDY_PARTNER: 'study_partner',
  MENTOR: 'mentor',
} as const;

export type TrustLevel = (typeof TrustLevel)[keyof typeof TrustLevel];

export const Persona = {
  GUIDE: 'guide',
  TUTOR: 'tutor',
  PARTNER: 'partner',
} as const;

export type Persona = (typeof Persona)[keyof typeof Persona];

export const SESSION_COUNT_THRESHOLDS: Record<TrustLevel, { min: number; persona: Persona }> = {
  stranger: { min: 0, persona: 'guide' },
  acquaintance: { min: 3, persona: 'guide' },
  friend: { min: 7, persona: 'tutor' },
  study_partner: { min: 15, persona: 'tutor' },
  mentor: { min: 30, persona: 'partner' },
} as const;

export const TRUST_DECAY_DAYS = 14 as const;

export const PERSONA_LABELS: Record<Persona, string> = {
  guide: 'Guide',
  tutor: 'Tutor',
  partner: 'Study Partner',
} as const;

export const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  guide: 'Explains concepts step by step, checks understanding frequently',
  tutor: 'Assumes baseline knowledge, asks Socratic questions',
  partner: 'Collaborative, challenges assumptions, suggests deeper topics',
} as const;
