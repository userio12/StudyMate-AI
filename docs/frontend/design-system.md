# Design System

## Design Philosophy

StudyMate AI is an education tool — grounded in the physical world of study: paper, chalkboards, marginalia, highlighters. The design system takes cues from academic materials (notebooks, textbooks, lecture slides) and translates them into digital form. The result is warm, intentional, and unmistakably *educational* — never generic SaaS.

**One aesthetic risk:** A warm parchment-and-ink palette with terracotta accents, paired with an ambient "StudyMate glow" — a subtle gradient-mesh + noise-grain overlay on hero cards and empty states that evokes the texture of chalk on a dark board or sunlight on a desk. This becomes the visual signature.

## Design Tokens

All tokens are defined as CSS variables in `globals.css` and consumed via Tailwind utility classes.

### Colors

The palette is grounded in **academic warmth**: parchment backgrounds, ink-blue text, and terracotta for energetic actions.

```css
:root {
  /* Backgrounds — warm, paper-like */
  --background: 40 20% 96%;            /* off-white #F8F6F3 */
  --foreground: 230 35% 16%;           /* deep navy #1A1F36 */
  --card: 40 15% 92%;                  /* parchment #F0EDE6 */
  --card-foreground: 230 35% 16%;
  --muted: 40 12% 88%;
  --muted-foreground: 230 10% 45%;

  /* Brand — warm, energetic */
  --primary: 16 52% 54%;               /* terracotta #C86E4B */
  --primary-foreground: 0 0% 100%;
  --secondary: 184 41% 30%;            /* deep teal #2D6A6F */
  --secondary-foreground: 0 0% 100%;

  /* Accents */
  --accent: 38 61% 56%;                /* amber #D4A04A */
  --accent-foreground: 230 35% 16%;
  --destructive: 0 65% 51%;            /* red */
  --destructive-foreground: 0 0% 100%;

  /* UI */
  --border: 40 12% 84%;
  --input: 0 0% 100%;
  --ring: 16 52% 54%;
  --radius: 0.5rem;

  /* Shadows — warm-toned */
  --shadow-sm: 0 1px 3px rgba(26, 31, 54, 0.06);
  --shadow-md: 0 4px 12px rgba(26, 31, 54, 0.08);
  --shadow-lg: 0 8px 30px rgba(26, 31, 54, 0.1);

  /* StudyMate glow — ambient gradient for hero/empty states */
  --glow-from: 16 52% 54% / 8%;
  --glow-to: 38 61% 56% / 4%;
}

.dark {
  --background: 230 35% 8%;            /* deep navy #0F1225 */
  --foreground: 40 20% 92%;            /* warm white */
  --card: 230 30% 12%;
  --muted: 230 20% 18%;
  --muted-foreground: 230 12% 60%;
  --border: 230 20% 20%;
  --input: 230 25% 14%;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.6);
  --glow-from: 16 52% 54% / 12%;
  --glow-to: 38 61% 56% / 6%;
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', ...fontFamily.serif],     /* landing page hero only */
        heading: ['Space Grotesk', ...fontFamily.sans],  /* page titles, cards */
        body: ['DM Sans', ...fontFamily.sans],           /* paragraphs, labels */
        ui: ['Satoshi', ...fontFamily.sans],             /* labels, meta, chrome */
        mono: ['JetBrains Mono', ...fontFamily.mono],    /* code, technical */
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      backgroundImage: {
        'studymate-glow': 'radial-gradient(ellipse at 50% 0%, hsl(var(--glow-from)), hsl(var(--glow-to)) 70%, transparent 100%)',
        'noise': "url('/noise.png')",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

## Typography

### Font Stack

Fraunces is used **only** on the landing page hero — it provides editorial warmth that signals "this is not another SaaS." Space Grotesk is deliberately kept for dashboard headings: its technical, geometric character fits the "AI tutor" subject matter. DM Sans provides proven readability for body text. Satoshi handles UI chrome (labels, badges, meta text) at smaller sizes where its tighter metrics save space.

| Role | Font | Weights | Use Case |
|---|---|---|---|
| **Display** | Fraunces | 300, 600, 700 | Landing page hero only |
| **Heading** | Space Grotesk | 500, 600, 700 | Dashboard titles, card headings |
| **Body** | DM Sans | 400, 500, 700 | Paragraphs, chat messages, buttons |
| **UI** | Satoshi | 400, 500, 700 | Labels, badges, meta text, nav |
| **Mono** | JetBrains Mono | 400, 600 | Code blocks, file names, technical terms |

### Type Scale

Fluid scale using `clamp()` for responsive typography without breakpoint classes:

```tsx
/* Display (landing only) — Fraunces */
<h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.1] tracking-tight">
  Turn PDFs into your personal AI tutor
</h1>

/* Page title — Space Grotesk */
<h1 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-tight">
  My Documents
</h1>

/* Section heading */
<h2 className="font-heading text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold">
  How It Works
</h2>

/* Card heading */
<h3 className="font-heading text-xl font-semibold">
  Upload your PDF
</h3>

/* Subheading / label — Satoshi */
<h4 className="font-ui text-base font-medium text-muted-foreground">
  Choose your course material
</h4>

/* Body text — DM Sans */
<p className="font-body text-base leading-relaxed max-w-prose">
  StudyMate AI reads your course PDFs and lets you...
</p>

/* Small / meta — Satoshi */
<span className="font-ui text-sm text-muted-foreground">
  5 documents · Last updated 2h ago
</span>

/* Caption */
<small className="font-ui text-xs text-muted-foreground">
  Page 42 of 128
</small>
```

### Typographic Rules

These rules are **enforced in all generated UI code** without exception:

**Quotes & Apostrophes — Always Curly**

```tsx
// ✅ Correct
<p>She said &ldquo;hello&rdquo; — it&rsquo;s fine.</p>
<p>She said {"\u201C"}hello{"\u201D"} &mdash; it{"\u2019"}s fine.</p>

// ❌ Wrong
<p>She said "hello" - it's fine.</p>
```

**Dashes — Three Distinct Characters**

| Character | Usage | HTML |
|---|---|---|
| `-` hyphen | Compound words, line breaks | `cost-effective` |
| `&ndash;` en dash | Ranges 1–10, connections | `pages 42–128` |
| `&mdash;` em dash | Sentence breaks — like this | `Think again — the best` |

Never approximate with `--` or `---`.

**Ellipsis**
```tsx
// ✅ Correct
<span>Loading&hellip;</span>

// ❌ Wrong
<span>Loading...</span>
```

**All Caps — Less Than One Line, Always Letterspaced**
```css
text-transform: uppercase;
letter-spacing: 0.06em;
```

Never all-caps entire paragraphs. Use for labels, badges, and section headers only.

**Small Caps — Real Only**
```css
font-variant-caps: small-caps;
/* or in Tailwind via arbitrary selector */
```

**Line Length — 45–90 Characters**
```css
max-width: 65ch;  /* on all text containers */
```

**Line Spacing — 120–145% of Point Size**
```css
line-height: 1.5;   /* body text */
line-height: 1.1;   /* headings */
```

**Kerning**
```css
font-feature-settings: "kern" 1;
text-rendering: optimizeLegibility;
```

**Mixing Fonts — Max 2 Families Per View**
- Display (Fraunces) + Body (DM Sans) = editorial, trustworthy
- Heading (Space Grotesk) + UI (Satoshi) = technical, clean
- Never more than 2 typefaces in a single view

### Prose (Chat Messages)

```css
/* Chat markdown rendering */
.prose {
  --tw-prose-body: hsl(var(--foreground));
  --tw-prose-headings: hsl(var(--foreground));
  --tw-prose-bold: hsl(var(--foreground));
  --tw-prose-code: hsl(var(--foreground));
  --tw-prose-links: hsl(var(--primary));
  max-width: 65ch;
}
```

## Spacing

Based on a 4px grid, using Tailwind's built-in spacing scale:

```
p-1 (4px)     — tight icon/text spacing
p-2 (8px)     — dense card padding
p-3 (12px)    — input padding, badge padding
p-4 (16px)    — default card padding
p-6 (24px)    — section spacing, card groups
p-8 (32px)    — page padding
p-12 (48px)   — section separation
p-16 (64px)   — major layout gaps
```

**Dashboard grid:**
```
max-w-7xl mx-auto px-4 md:px-8
Sidebar: w-64 hidden md:flex
Content: flex-1 min-w-0
```

**Readable text containers:**
```
max-w-prose (65ch) — body text, chat messages
max-w-2xl          — narrow forms (sign-in, settings)
max-w-4xl          — document detail content
```

## Shadows

Warm-toned shadows using the deep navy from the palette:

```css
shadow-sm   — cards, inputs (default state)
shadow-md   — cards (hover), dropdowns, tooltips
shadow-lg   — modals, sheets, dialog overlays
hover:shadow-lg — card hover state
```

## Border Radius

```css
rounded-sm  (4px) — small inputs, badges
rounded-md  (6px) — buttons, cards (default)
rounded-lg  (8px) — dialogs, sheets
rounded-2xl (16px) — chat bubbles, avatars
rounded-full      — pills, avatars
```

## The StudyMate Glow

The signature visual element — a warm radial gradient with subtle noise texture applied to hero sections, empty states, and the landing page. It evokes the ambient light of a desk lamp on paper.

```tsx
// Usage pattern for hero / empty states
<div className="relative bg-studymate-glow before:absolute before:inset-0 before:bg-noise before:opacity-[0.03] before:mix-blend-multiply before:pointer-events-none">
  {/* content */}
</div>
```

Applied to:
- Landing page hero section
- Dashboard empty states (no documents yet, no quizzes yet)
- Chat welcome screen
- Quiz result score area

## Animation Tokens

```css
/* Durations */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;

/* Easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### Component Animations

| Component | Animation | CSS/Motion |
|---|---|---|
| **Button hover** | Background shift + subtle lift | `transition-all duration-150` |
| **Card hover** | Shadow deepen | `transition-shadow duration-200` |
| **Modal open** | Scale + fade | Framer Motion `scale: 0.95 → 1, opacity: 0 → 1` |
| **Chat message** | Slide up + fade | `motion.div` `initial={{y:8, opacity:0}}` |
| **Streaming text** | Typewriter | Custom `StreamingText` component |
| **Citation badge** | Scale pulse on new | `motion.span` `whileHover={{scale:1.2}}` |
| **Score circle** | SVG path draw | Framer Motion `pathLength` |
| **Page transition** | Fade + slide | `<AnimatePresence>` |
| **Skeleton load** | Pulse shimmer | Tailwind `animate-pulse` |
| **Dark mode** | Color crossfade | `transition-colors duration-300` on `html` |
| **StudyMate glow** | Subtle pulse (ambient only) | CSS `@keyframes glow-pulse` 8s ease-in-out infinite |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Framer Motion respects this automatically with `useReducedMotion()`:

```typescript
import { useReducedMotion } from 'framer-motion';

function StreamingText({ content }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span>{content}</span>;
  }

  return <AnimatedText content={content} />;
}
```

## Icon Conventions

- Use Lucide React icons only (no emoji as icons)
- Size: `h-4 w-4` (16px) for inline, `h-5 w-5` (20px) for nav, `h-6 w-6` (24px) for empty states
- Color: inherit text color or use `text-muted-foreground` for secondary

```tsx
import { Upload, MessageSquare, Brain, Users } from 'lucide-react';

// Good
<Upload className="h-5 w-5 text-muted-foreground" />

// Bad — no emoji icons
<span role="img">📄</span>
```

## Component Convention

Every component folder follows this pattern:

```
component-name/
├── component-name.tsx       # Main component
├── component-name.test.tsx  # Tests
├── component-name.stories.tsx # Storybook story
└── index.ts                # Re-export
```

Custom components use the `cn()` utility for className merging:

```tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-ui font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
```
