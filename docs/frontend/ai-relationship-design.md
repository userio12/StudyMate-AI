# AI Relationship Design

StudyMate AI is not a transactional chatbot — it's an ongoing study partner. Every interaction builds on past sessions, adapts to the user's learning level, and evolves trust over time. This document defines the relationship-centric UX patterns that distinguish StudyMate from generic AI chat.

## Core Principle

Traditional UX optimizes isolated screens. Relationship-centric UX optimizes the arc of learning across days and months. The AI tutor should feel like it *remembers* the user, *adapts* to their pace, and *anticipates* what they need next.

## The Five Pillars

### 1. Memory Display

The AI surfaces awareness of past interactions naturally — not as a data dump, but as contextual cues.

```tsx
// Chat welcome — returning user
// On conversation open, check for prior context
<ChatInterface.Empty>
  <p className="text-muted-foreground">
    Welcome back! You were studying{" "}
    <strong>Chapter 4: Cellular Respiration</strong> last time.
    Your weak area was <strong>glycolysis regulation</strong>.
  </p>
  <p className="text-sm text-muted-foreground">
    Want to review glycolysis, or move to the next topic?
  </p>
  <div className="flex gap-2 mt-4">
    <Button>Review glycolysis</Button>
    <Button variant="outline">Continue to next topic</Button>
  </div>
</ChatInterface.Empty>

// Quiz generation — adapts to past performance
// Quiz generator reads past attempt data before building questions
// Weakest 40% of topics get 60% of new quiz questions
// Topics never attempted get at least one question
```

**Implementation:** The chat load request includes `lastSessionSummary` from the backend, derived from the last 3 conversations' topic tags and quiz performance data.

### 2. Adaptive Difficulty

Quiz difficulty adjusts based on performance trajectory, not just the last score.

```typescript
// lib/quiz-difficulty.ts
interface DifficultyState {
  level: 'recall' | 'understand' | 'apply' | 'analyze';
  streak: number; // consecutive correct answers
  weakTopics: string[];
}

function getNextDifficulty(history: QuizAttempt[]): DifficultyState {
  const recent = history.slice(-5);
  const accuracy = recent.filter(a => a.score / a.total > 0.7).length / recent.length;

  if (accuracy > 0.8) return { level: 'analyze', streak: recent.length, weakTopics: [] };
  if (accuracy > 0.6) return { level: 'apply', streak: recent.length, weakTopics: [] };
  if (accuracy > 0.4) return { level: 'understand', streak: recent.length, weakTopics: [] };
  return { level: 'recall', streak: recent.length, weakTopics: [] };
}
```

**UI Indication:**

```tsx
// Show difficulty level subtly
<div className="flex items-center gap-2 text-xs text-muted-foreground">
  <Brain className="h-3 w-3" />
  <span>Difficulty: {difficulty.label}</span>
  {/* After 3+ correct in a row */}
  {streak >= 3 && (
    <span className="text-amber-600">×{streak} streak &mdash; levelling up!</span>
  )}
</div>
```

### 3. Session Continuity

Chat context persists across days. The AI picks up where the user left off.

```
New session (Monday):
  User: "What is the Krebs cycle?"
  AI:  [Explains Krebs cycle]

Same session continues → user studies for 2 hours

New session (Wednesday):
  User: (opens chat)
  AI:  "Last time we covered the Krebs cycle and oxidative phosphorylation.
        You asked about ATP yield — here's a quick recap before we continue:
        [3-bullet summary]"
```

**Backend contract:** Each chat message includes a `continuityContext` field:

```typescript
interface ContinuityContext {
  previousSessions: {
    date: string;
    topics: string[];
    quizScore?: { correct: number; total: number };
  }[];
  weakAreas: string[];
  nextSuggested: string;
}
```

### 4. Persona State

The AI has a consistent personality that evolves with the relationship, not a fixed system prompt on every message.

| Session Count | AI Persona | UX Pattern |
|---|---|---|
| 1–3 | **Guide** — explanatory, checks understanding frequently | "Does that make sense? Want me to rephrase?" |
| 4–10 | **Tutor** — assumes baseline knowledge, asks Socratic questions | "Why do you think that happens? Let me check your understanding..." |
| 10+ | **Study Partner** — collaborative, challenges assumptions | "You've got this down. Let's try a harder angle: what if the enzyme is inhibited?" |

```tsx
// Persona badge shown in chat header
<div className="flex items-center gap-2">
  <span className="text-sm font-medium">StudyMate</span>
  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
    {persona.label}
  </span>
</div>
```

### 5. Trust Progression

New users get more guidance; returning users get more autonomy.

```
New user:
  ├── Guided onboarding: "Upload a PDF to get started"
  ├── Chat suggestions: "Try asking 'Summarize this document'"
  └── Quiz: auto-generated from first document

Returning user (5+ sessions):
  ├── No onboarding — straight to dashboard
  ├── Chat: blank canvas, user drives the topic
  └── Quiz: "Generate from weak areas" as default, "Custom quiz" as advanced option
```

```tsx
// hooks/use-user-tenure.ts
export function useTrustLevel() {
  const { data: user } = useUser();

  const sessionCount = user?.publicMetadata?.sessionCount ?? 0;
  const trustLevel: 'onboarding' | 'established' | 'power' =
    sessionCount < 3 ? 'onboarding'
    : sessionCount < 10 ? 'established'
    : 'power';

  return {
    trustLevel,
    showOnboarding: trustLevel === 'onboarding',
    showAdvancedFeatures: trustLevel !== 'onboarding',
    showBetaFeatures: trustLevel === 'power',
  };
}
```

## Implementation Guide

### API Patterns

```typescript
// GET /chat/:id — returns messages + continuity context
interface ChatSessionResponse {
  messages: Message[];
  continuity: {
    previousTopics: string[];
    lastSessionDate: string;
    weakAreas: string[];
    suggestedTopic: string;
  };
  persona: 'guide' | 'tutor' | 'partner';
}

// POST /quiz/generate — accepts difficulty target
interface GenerateQuizRequest {
  documentId: string;
  difficulty?: 'recall' | 'understand' | 'apply' | 'analyze';
  focusTopics?: string[]; // weak areas to prioritize
  questionCount?: number;
}
```

### Frontend Hooks

```typescript
// hooks/use-relationship.ts
export function useRelationship() {
  const { trustLevel, showOnboarding } = useTrustLevel();
  const { persona, continuity } = useContinuity(conversationId);

  return {
    greeting: continuity
      ? `Welcome back! You were studying ${continuity.suggestedTopic}`
      : 'Ask anything about your course material',
    persona,
    showOnboarding,
    adaptiveDifficulty: trustLevel !== 'onboarding',
  };
}
```

### Error States & Empty States

| State | UX |
|---|---|
| **First time user, no documents** | Guided onboarding: "Upload a PDF to start learning" |
| **Returning user, no documents** | "Your last documents were deleted. Upload new ones to continue" |
| **Returning user, has documents** | Continuity-aware welcome + topic suggestion |
| **Quiz history empty** | "Take your first quiz from any document" |
| **Quiz history exists** | Weak topics highlighted, "Improve your score on X" |

## Version History

- v1.0.0 (2026-06-14): Initial relationship design specification
