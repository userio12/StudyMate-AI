# Frontend Testing

## Test Strategy

| Test Type | Tool | Scope | Speed | Run Frequency |
|---|---|---|---|---|
| **Unit** | Vitest | Hooks, utilities, pure functions | ms | Every commit |
| **Component** | Testing Library + Vitest | Individual components in isolation | ms | Every commit |
| **Integration** | Testing Library | Feature-level interactions (form → API call → state change) | seconds | Every PR |
| **E2E** | Playwright | Full user flows (auth → upload → chat → quiz) | seconds | Every PR |
| **Visual** | Storybook + Chromatic | Visual regression detection | minutes | Before release |

## Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.stories.tsx',
        '**/*.test.tsx',
        '**/ui/*',        // shadcn primitives (tested by Radix)
      ],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## Unit Tests

### Testing Hooks

```typescript
// hooks/__tests__/use-debounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } },
    );

    rerender({ value: 'world' });
    // Value should still be 'hello' (not yet debounced)
    expect(result.current).toBe('hello');

    // Fast-forward past the debounce delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });
});
```

## Component Tests

```typescript
// components/chat/__tests__/chat-message.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../chat-message';

describe('ChatMessage', () => {
  it('should render user message right-aligned', () => {
    render(
      <ChatMessage
        role="user"
        content="What is backpropagation?"
      />,
    );

    const message = screen.getByText('What is backpropagation?');
    expect(message).toBeInTheDocument();
    expect(message.closest('.rounded-br-sm')).toBeInTheDocument();
  });

  it('should render assistant message with markdown', () => {
    render(
      <ChatMessage
        role="assistant"
        content="**Backpropagation** is an algorithm that computes gradients."
      />,
    );

    expect(screen.getByText('Backpropagation')).toBeInTheDocument();
    expect(screen.getByText('Backpropagation').tagName).toBe('STRONG');
  });

  it('should render citation badges', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Backpropagation computes gradients [citation:0]"
        citations={[
          { index: 0, pageNumber: 42, excerpt: 'Chain rule explanation...' },
        ]}
      />,
    );

    expect(screen.getByText('[0]')).toBeInTheDocument();
  });

  it('should show streaming indicator', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Partial response"
        isStreaming
      />,
    );

    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
  });
});
```

```typescript
// components/documents/__tests__/upload-zone.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadZone } from '../upload-zone';

describe('UploadZone', () => {
  const createFile = (name: string, type: string, size: number) => {
    const file = new File(['content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('should show idle state initially', () => {
    render(<UploadZone onUploadComplete={vi.fn()} />);

    expect(screen.getByText(/Drop PDF here/i)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
  });

  it('should show dragging state', async () => {
    render(<UploadZone onUploadComplete={vi.fn()} />);

    const zone = screen.getByTestId('upload-zone');
    fireEvent.dragEnter(zone);

    expect(screen.getByText(/Drop to upload/i)).toBeInTheDocument();
  });

  it('should show error for non-PDF files', async () => {
    const user = userEvent.setup();
    render(<UploadZone onUploadComplete={vi.fn()} />);

    const file = createFile('image.png', 'image/png', 1000);
    const input = screen.getByLabelText(/upload/i);

    await user.upload(input, file);

    expect(screen.getByText(/only PDF files/i)).toBeInTheDocument();
  });

  it('should show error for files over size limit', async () => {
    const user = userEvent.setup();
    render(<UploadZone onUploadComplete={vi.fn()} maxSize={1024} />);

    const file = createFile('large.pdf', 'application/pdf', 2000);
    const input = screen.getByLabelText(/upload/i);

    await user.upload(input, file);

    expect(screen.getByText(/exceeds.*limit/i)).toBeInTheDocument();
  });

  it('should call onUploadComplete on successful upload', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    // Mock fetch to return successful upload
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { presignedUrl: 'https://s3...' } }),
    });

    render(<UploadZone onUploadComplete={onComplete} />);

    const file = createFile('notes.pdf', 'application/pdf', 5000);
    const input = screen.getByLabelText(/upload/i);

    await user.upload(input, file);

    // Should show uploading progress
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for completion...
  });
});
```

## E2E Tests (Playwright)

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete user journey: auth → upload → chat → quiz', async ({ page }) => {
  // 1. Landing page loads
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Turn your PDFs');

  // 2. Sign in
  await page.click('text=Get Started');
  await page.waitForURL('**/sign-up**');

  // Clerk handles auth UI — test with test credentials
  await page.fill('input[name=email]', 'test@example.com');
  await page.fill('input[name=password]', 'testpassword123');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard**');

  // 3. Dashboard loads with welcome state
  await expect(page.locator('text=Upload your first PDF')).toBeVisible();

  // 4. Navigate to documents
  await page.click('text=Documents');
  await page.waitForURL('**/documents**');
  await expect(page.locator('text=No documents yet')).toBeVisible();

  // 5. Upload a document
  await page.click('text=Upload');
  await page.waitForURL('**/documents/upload**');

  // Set up file input
  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles({ name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  await expect(page.locator('text=Uploading')).toBeVisible();

  // Wait for processing to complete
  await page.waitForSelector('text=Ready', { timeout: 30000 });

  // 6. Start a chat
  await page.click('text=Chat about this');
  await page.waitForURL('**/chat/**');
  await expect(page.locator('text=Ask anything')).toBeVisible();

  // 7. Send a message
  await page.fill('textarea', 'What is this document about?');
  await page.click('button[type=submit]');
  await page.waitForSelector('[data-testid="chat-message-assistant"]', { timeout: 15000 });
  await expect(page.locator('[data-testid="chat-message-assistant"]')).toBeVisible();

  // 8. Generate a quiz
  await page.click('text=Quiz');
  await page.waitForURL('**/quiz**');
  await page.click('text=Generate Quiz');
  await page.waitForSelector('[data-testid="question-card"]', { timeout: 20000 });

  // 9. Answer a question
  await page.click('text=A');
  await page.click('text=Submit');
  await expect(page.locator('[data-testid="score-circle"]')).toBeVisible();
});
```

## Running Tests

```bash
# Unit + component tests
pnpm --filter frontend test

# Watch mode
pnpm --filter frontend test:watch

# Coverage
pnpm --filter frontend test:coverage

# E2E tests (requires dev server running)
pnpm --filter frontend test:e2e

# E2E with UI mode
pnpm --filter frontend test:e2e -- --ui

# Specific file
pnpm --filter frontend test -- components/chat/__tests__/chat-message.test.tsx
```

## CI Integration

```yaml
# Included in .github/workflows/ci.yml
test-frontend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm --filter frontend test -- --coverage
    - uses: codecov/codecov-action@v4

e2e-frontend:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: pgvector/pgvector:pg16
      env:
        POSTGRES_DB: studymate_test
        POSTGRES_PASSWORD: postgres
      ports:
        - 5432:5432
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - name: Start backend
      run: pnpm --filter backend start &
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/studymate_test
    - name: Start frontend
      run: pnpm --filter frontend build && pnpm --filter frontend start &
    - name: Run Playwright tests
      run: pnpm --filter frontend test:e2e
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: apps/frontend/playwright-report/
```
