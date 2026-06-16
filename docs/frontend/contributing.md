# Contributing to the Frontend

## Code Style

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Components** | PascalCase | `ChatMessage` |
| **Files (components)** | kebab-case | `chat-message.tsx` |
| **Files (pages)** | page.tsx (Next.js convention) | `page.tsx` |
| **Hooks** | use + camelCase | `useStreamingChat` |
| **Store** | camelCase + Store | `chatStore` |
| **Types** | PascalCase | `Message` |
| **CSS classes** | Tailwind utilities | (no custom classes unless necessary) |

### Component Pattern

```typescript
// components/chat/chat-message.tsx
'use client';

import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
  className?: string;
}

export function ChatMessage({
  role,
  content,
  citations,
  isStreaming,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-2xl max-w-[80%]',
        role === 'user'
          ? 'ml-auto bg-primary/10 rounded-br-sm'
          : 'mr-auto bg-card border rounded-bl-sm',
        className,
      )}
    >
      {/* content */}
    </div>
  );
}
```

### Import Order

```typescript
// 1. React / Next.js
import { useState } from 'react';
import { usePathname } from 'next/navigation';

// 2. Third-party
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

// 3. Internal (alphabetical)
import { ChatMessage } from '@/components/chat/chat-message';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chat-store';
```

## Component Conventions

### Server vs Client Components

```typescript
// ✅ Default to Server Component
// /app/(dashboard)/documents/page.tsx
export default async function DocumentsPage() {
  const documents = await fetchDocuments();
  return <DocumentList initialData={documents} />;
}

// ✅ Use 'use client' only when needed
// State, effects, event handlers, browser APIs
'use client';
export function DocumentList({ initialData }) {
  const [documents, setDocuments] = useState(initialData);
  // ...
}
```

### Props Interface

```typescript
// Always define props interface
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

// Use default values for optional props
export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  // ...
}
```

### Custom Hooks

```typescript
// hooks/use-documents.ts
import useSWR from 'swr';
import { useApiClient } from '@/lib/api-client';

export function useDocuments(page = 1) {
  const { get } = useApiClient();

  return useSWR(
    `/documents?page=${page}&limit=20`,
    (url) => get<PaginatedDocuments>(url),
    {
      keepPreviousData: true,
      dedupingInterval: 2000,
    },
  );
}
```

### Tailwind Patterns

```jsx
// Combine classes with cn()
<div className={cn(
  "flex items-center gap-2 px-4 py-2 rounded-lg",
  isActive && "bg-primary/10 text-primary",
  className,
)} />

// Use CSS variables for theme-aware colors
bg-background text-foreground
bg-card border
text-muted-foreground
bg-primary text-primary-foreground

// Avoid inline styles
❌ <div style={{ marginTop: '16px' }}>
✅ <div className="mt-4">

// Use shadcn components directly
✅ <Button variant="outline" size="sm">
❌ <button className="px-3 py-1.5 text-sm border rounded-md">
```

## Commit Convention

Same as backend: [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <description>
```

### Frontend Scopes

| Scope | Area |
|---|---|
| `chat` | Chat interface, streaming, citations |
| `documents` | Upload, document list, processing |
| `quiz` | Quiz questions, results, scoring |
| `rooms` | Study rooms, real-time chat |
| `ui` | shadcn components, design system, generic UI |
| `layout` | Sidebar, navbar, dashboard shell |
| `landing` | Landing page, marketing pages |
| `auth` | Clerk integration, sign-in/sign-up |
| `perf` | Performance optimizations |
| `a11y` | Accessibility improvements |

### Examples

```
feat(chat): add streaming text typewriter animation
fix(documents): handle upload error for empty PDF
a11y(chat): add aria-live region for streaming messages
perf(ui): lazy load chart components
docs(contributing): add frontend style guide
```

## Pull Request Process

1. **Create a branch**: `feat/streaming-animation`, `fix/upload-race-condition`
2. **Make changes** following conventions.
3. **Run checks**:
   ```bash
   pnpm --filter frontend lint
   pnpm --filter frontend typecheck
   pnpm --filter frontend test
   pnpm --filter frontend build
   ```
4. **Add tests** for new components or hooks.
5. **Add Storybook stories** for new components (if applicable).
6. **Push and open a PR** with:
   - Description of the change
   - Screenshots (before/after for UI changes)
   - Link to related issue
7. **Request review** from maintainers.

## Creating a New Component

```bash
# 1. Create component directory
mkdir src/components/feature/my-component

# 2. Create files
touch src/components/feature/my-component/my-component.tsx
touch src/components/feature/my-component/my-component.test.tsx
touch src/components/feature/my-component/my-component.stories.tsx
touch src/components/feature/my-component/index.ts
```

**`index.ts`:**
```typescript
export { MyComponent } from './my-component';
export type { MyComponentProps } from './my-component';
```

**`my-component.stories.tsx`:**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta = {
  title: 'Features/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // default props
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

## Design System Contributions

1. **Never modify shadcn/ui primitives** in `components/ui/` — they are auto-generated and updated via `npx shadcn@latest add`.
2. **Custom components** belong in feature directories (`components/chat/`, `components/documents/`).
3. **Design tokens** are in `globals.css` — any new color, spacing, or animation token goes there first.
4. **Tailwind config** changes should be discussed — they affect the entire application.

## Testing Guidelines

```typescript
// DO: Test behavior, not implementation
it('shows error message when upload fails', async () => { ... });

// DO: Test accessibility
it('has correct aria labels', () => { ... });

// DO: Test edge cases
it('handles empty document list', () => { ... });
it('truncates long titles', () => { ... });

// DO: Use Testing Library queries by role/text
screen.getByRole('button', { name: /submit/i });
screen.getByText(/document uploaded/i);

// DON'T: Test by internal class names
container.querySelector('.custom-class'); // ✗

// DON'T: Test state internals
expect(component.state().isOpen).toBe(true); // ✗
```

## Getting Help

- Check existing docs in `/docs/frontend/`
- Look at similar components for patterns
- Start Storybook to explore existing components:
  ```bash
  pnpm --filter frontend storybook
  ```
- Open a discussion or issue on GitHub
