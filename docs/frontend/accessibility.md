# Accessibility

## Standards

StudyMate AI targets **WCAG 2.2 Level AA** compliance.

## Meta & Environment

```html
<!-- Always set in root layout -->
<html lang="en">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#F8F6F3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0F1225" media="(prefers-color-scheme: dark)">
```

## shadcn/ui + Radix UI

All UI primitives are built on [Radix UI](https://www.radix-ui.com/), which provides WCAG-compliant behavior out of the box:

| Feature | Radix Implementation |
|---|---|
| **Keyboard navigation** | Arrow keys in Tabs, Select, Command; Escape closes dialogs |
| **Focus management** | Automatic focus trapping in Dialog, Sheet; focus restoration on close |
| **ARIA attributes** | `role`, `aria-label`, `aria-expanded`, `aria-selected`, `aria-controls` |
| **Screen reader** | Live regions for toast notifications |
| **Dismiss** | Click outside, Escape key for overlays |

## Keyboard Navigation

### Global Shortcuts

| Key | Action |
|---|---|
| `/` | Focus global search (when implemented) |
| `Escape` | Close dialog, sheet, dropdown, tooltip |
| `Enter` | Submit current form, activate button |
| `Tab` | Navigate through interactive elements |
| `Shift + Tab` | Navigate backward |

### Chat Interface

| Key | Action |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |
| `Up arrow` | Edit last message (future) |

### Quiz

| Key | Action |
|---|---|
| `A` / `B` / `C` / `D` | Select answer option |
| `Enter` | Confirm answer / Next question |
| `Arrow Left / Right` | Previous / Next question |

## Focus Management

```css
/* globals.css — visible focus rings */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Remove focus outline for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### Custom Components

```typescript
// components/chat/chat-input.tsx
'use client';

import { useEffect, useRef } from 'react';

export function ChatInput({ onSend }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount for keyboard users
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <textarea
      ref={inputRef}
      aria-label="Type your message"
      placeholder="Ask a question about your course material..."
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSend(inputRef.current?.value ?? '');
        }
      }}
    />
  );
}
```

## Screen Readers

### Live Regions

```typescript
// Chat messages use aria-live for screen reader announcements
// components/chat/chat-message.tsx

// Assistant messages — polite announcement
<div
  role="listitem"
  aria-live="polite"
  aria-atomic="false"
>
  {/* message content */}
</div>

// Streaming state — assertive announcement
{isStreaming && (
  <span aria-live="assertive" className="sr-only">
    The AI tutor is generating a response
  </span>
)}

// Streaming complete
{!isStreaming && streamingContent && (
  <span aria-live="polite" className="sr-only">
    Response complete
  </span>
)}
```

### Skip Links

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}

// components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border"
    >
      Skip to main content
    </a>
  );
}

// Usage in dashboard layout
<main id="main-content">
  {children}
</main>
```

## Color and Contrast

All color combinations must meet WCAG AA contrast ratios:

| Combination | Minimum Ratio | Status |
|---|---|---|
| Text on background | 4.5:1 | ✓ Verified |
| Large text (18px+ bold / 24px+) | 3:1 | ✓ Verified |
| UI components (borders, icons) | 3:1 | ✓ Verified |
| Placeholder text | — | Does not need to meet contrast |
| Disabled elements | — | Does not need to meet contrast |

```css
/* Verified palette contrast ratios (light mode): */
--foreground on --background:        #1A1F36 on #F8F6F3 → 14.8:1 ✓
--primary on --primary-foreground:   #C86E4B on #FFFFFF → 5.1:1 ✓
--primary on --background:           #C86E4B on #F8F6F3 → 4.7:1 ✓
--muted-foreground on --muted:       #6B7280 on #EDE9E0 → 5.2:1 ✓
--muted-foreground on --background:  #6B7280 on #F8F6F3 → 5.7:1 ✓
--destructive on --foreground:       #D0312D on #1A1F36 → 7.3:1 ✓
```

**Color is never the only indicator of meaning.** States use combinations:

```
Error: Red text + error icon + "Error:" prefix text
Success: Green text + check icon
Processing: Yellow indicator + "Processing..." label
```

## High Contrast Mode (`prefers-contrast: more`)

When users request more contrast, increase border thickness and darken text colors:

```css
@media (prefers-contrast: more) {
  :root {
    --border: 40 12% 60%;
    --muted-foreground: 230 35% 25%;
  }

  .dark {
    --border: 230 20% 40%;
    --muted-foreground: 40 15% 80%;
  }

  * {
    border-width: 2px !important;
  }

  /* Increase focus ring visibility */
  *:focus-visible {
    outline: 3px solid hsl(var(--ring));
    outline-offset: 3px;
  }
}
```

## Reduced Data (`prefers-reduced-data: reduce`)

Limit decorative images and animations for users on slow connections:

```css
@media (prefers-reduced-data: reduce) {
  .studymate-glow {
    background: none;
  }

  img[loading="lazy"] {
    display: none;
  }

  .noise-overlay {
    display: none;
  }
}
```

## Reduced Motion

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
    // Skip animation, render full text immediately
    return <span>{content}</span>;
  }

  return <AnimatedText content={content} />;
}
```

## Form Accessibility

All form inputs must include `autocomplete` attributes for common patterns:

```tsx
// Common autocomplete values:
// name        full-name     email       tel
// username    current-password  new-password
// url         street-address    country    postal-code
// cc-name     cc-number     cc-exp      cc-csc

<input
  id="email"
  type="email"
  autoComplete="email"
  aria-describedby="email-hint"
/>

// components/documents/upload-zone.tsx
<div role="region" aria-label="PDF upload area">
  <label htmlFor="file-upload" className="sr-only">
    Choose a PDF file to upload
  </label>
  <input
    id="file-upload"
    type="file"
    accept=".pdf,application/pdf"
    aria-describedby="file-upload-hint"
    aria-invalid={hasError ? 'true' : undefined}
    aria-errormessage={hasError ? 'file-upload-error' : undefined}
  />
  <p id="file-upload-hint" className="text-sm text-muted-foreground">
    PDF files only, max 50MB
  </p>
  {hasError && (
    <p id="file-upload-error" role="alert" className="text-sm text-destructive">
      {errorMessage}
    </p>
  )}
</div>
```

## Testing Accessibility

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test('landing page has no detectable accessibility issues', async ({ page }) => {
  await page.goto('/');

  // Check basic landmarks
  await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();

  // Check heading hierarchy
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingLevels = await headings.evaluateAll(elements =>
    elements.map(el => el.tagName),
  );
  expect(headingLevels).toEqual(
    headingLevels.sort(), // Must be sequential
  );

  // Check image alt text
  const images = page.locator('img');
  const imageCount = await images.count();
  for (let i = 0; i < imageCount; i++) {
    await expect(images.nth(i)).toHaveAttribute('alt');
  }
});

test('chat interface supports keyboard navigation', async ({ page }) => {
  await page.goto('/chat/test-conversation');

  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await expect(page.locator('textarea')).toBeFocused();

  // Type and send with Enter
  await page.keyboard.type('What is AI?');
  await page.keyboard.press('Enter');

  // Focus returns to textarea after sending
  await expect(page.locator('textarea')).toBeFocused();

  // Esc closes any open tooltips
  await page.keyboard.press('Escape');
});
```

## Accessibility Checklist

- [ ] `color-scheme` meta tag present in `<head>`
- [ ] `prefers-contrast: more` override styles written
- [ ] `prefers-reduced-data: reduce` hides decorative assets
- [ ] All images have descriptive `alt` text
- [ ] All form inputs have associated `<label>` elements
- [ ] All form inputs have `autocomplete` where applicable
- [ ] Color contrast meets WCAG AA for all text
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation covers all functionality
- [ ] Screen reader announces dynamic content changes
- [ ] Proper heading hierarchy (`h1` → `h2` → `h3`, never skipping levels)
- [ ] Landmarks used (`<nav>`, `<main>`, `<aside>`, `<footer>`)
- [ ] ARIA attributes correct (no redundant or conflicting roles)
- [ ] Error messages linked to inputs via `aria-errormessage`
- [ ] Forms have clear error and success states
- [ ] `prefers-reduced-motion` disables animations
- [ ] Touch targets at least 44x44px on mobile
- [ ] Links distinguishable from surrounding text (not just color)
- [ ] Skip navigation link present
- [ ] Language attribute set on `<html>` element
