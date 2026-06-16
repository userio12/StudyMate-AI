# Component Library

## shadcn/ui Components

Init all primitives with:

```bash
npx shadcn@latest add button card input badge avatar dialog
npx shadcn@latest add dropdown-menu progress skeleton tooltip tabs
npx shadcn@latest add sheet separator scroll-area command
npx shadcn@latest add sonner
```

### Customization Notes

All shadcn components are copied to `components/ui/` and can be freely modified. The following project-specific variants are added:

| Component | Custom Variants | Usage |
|---|---|---|
| `Button` | `variant="upload"` | Upload zone action |
| `Button` | `variant="ghost"` `size="icon-sm"` | Citation badge |
| `Card` | Custom wrapper `DocumentCard` | Document grid |
| `Badge` | `variant="success/warning/error"` | Document status |
| `Skeleton` | `variant="card"`, `"chat"` | Loading states |
| `Tooltip` | `side="top"`, `delayDuration={0}` | Citations |

## Composition Patterns

Use **compound components** to avoid boolean prop proliferation. Components with 3+ state booleans should be split into named sub-components.

```tsx
// ❌ Avoid — boolean explosion
<ChatInterface
  isLoading
  isEmpty
  isError
  isStreaming
  hasMessages={false}
  error={null}
  onRetry={handleRetry}
/>

// ✅ Prefer — compound composition
<ChatInterface>
  <ChatInterface.Loading />
  {/* or */}
  <ChatInterface.Empty onAction={startChat} />
  {/* or */}
  <ChatInterface.Active>
    <MessageList messages={messages} />
    <ChatInput onSend={handleSend} />
  </ChatInterface.Active>
  {/* or */}
  <ChatInterface.Error error={error} onRetry={handleRetry} />
</ChatInterface>
```

Implemented via a state-lifting pattern:

```tsx
// components/chat/chat-interface.tsx
function ChatInterface({ children }: { children: React.ReactNode }) {
  // Shared state lives here
  return <div className="flex flex-col h-full">{children}</div>;
}

ChatInterface.Loading = function Loading() { /* ... */ };
ChatInterface.Empty = function Empty({ onAction }: { onAction: () => void }) { /* ... */ };
ChatInterface.Active = function Active({ children }: { children: React.ReactNode }) { /* ... */ };
ChatInterface.Error = function Error({ error, onRetry }: { error: Error; onRetry: () => void }) { /* ... */ };
```

Apply this pattern to:
- `ChatInterface` — loading/empty/active/error states
- `UploadZone` — idle/dragging/uploading/processing/success/error
- `QuestionCard` — unanswered/selected/correct/incorrect/review
- `DashboardShell` — sidebar/content/navbar compounds

**Touch targets:** All interactive elements meet 44×44px minimum touch target on mobile. Verify with:

```css
/* Add to any small interactive element */
.icon-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Custom Components

### Chat Components

#### `ChatInterface`
```
Location: components/chat/chat-interface.tsx
Pattern: Compound component
Children: ChatInterface.Loading | ChatInterface.Empty | ChatInterface.Active | ChatInterface.Error

States:
├── Loading: Skeleton messages (3-4 pulsing lines)
├── Empty: "No messages yet. Ask something about your course!"
├── Active: Messages + streaming content + citations
└── Error: Error banner with retry button
```

#### `ChatMessage`
```
Location: components/chat/chat-message.tsx
Props: { role: 'user' | 'assistant'; content: string; citations?: Citation[]; isStreaming?: boolean }

Rendering:
├── User: right-aligned, bg-primary/10, rounded-2xl rounded-br-sm
├── Assistant: left-aligned, bg-card border, rounded-2xl rounded-bl-sm
├── Content: react-markdown + rehype-highlight
├── Citations: inline CitationBadge after each [citation:N]
└── Streaming: StreamingText + blinking cursor
```

#### `ChatInput`
```
Location: components/chat/chat-input.tsx
Props: { onSend: (content: string, documentIds: string[]) => void; isLoading: boolean }

States:
├── Idle: placeholder text + send icon
├── Typing: auto-resize textarea
├── Document selector: multi-select dropdown of user's documents
├── Sending: disabled button + spinner
└── Composing: show document count badge
```

#### `StreamingText`
```
Location: components/chat/streaming-text.tsx
Props: { content: string; speed?: number; onComplete?: () => void }

Behavior:
├── Start empty, append 1 char per `speed` ms
├── Uses requestAnimationFrame for accuracy
├── Blinking cursor during stream (CSS animation, not JS)
└── Cursor stops blinking on complete
```

#### `CitationBadge`
```
Location: components/chat/citation-badge.tsx
Props: { index: number; citation: Citation }

Rendering:
├── Superscript [1] with primary bg, white text
├── Hover: tooltip with "Page 42" + first 120 chars
├── Click: scroll to citation panel, highlight
├── Animation: scale pulse on first appearance
└── Touch target: min 44x44px
```

### Document Components

#### `UploadZone`
```
Location: components/documents/upload-zone.tsx
Pattern: Compound component
Children: UploadZone.Idle | UploadZone.Dragging | UploadZone.Uploading | UploadZone.Processing | UploadZone.Success | UploadZone.Error
Props: { onUploadComplete: (document: Document) => void; maxSize?: number }

States:
├── Idle: Dashed border, cloud-upload icon, "Drop PDF here or click to browse"
├── Dragging: Solid primary border, bg-primary/5, "Drop to upload"
├── Uploading: Progress bar (determinate 0-100%), file name displayed
├── Processing: Indeterminate spinner, "Extracting text and generating embeddings..."
├── Success: Green check, "Ready to chat"
└── Error: Red border, error message, retry button
```

#### `DocumentCard`
```
Location: components/documents/document-card.tsx
Props: { document: Document; onDelete?: () => void; onChat?: () => void }

Rendering:
├── Icon: FileText (PDF icon) or thumbnail
├── Title: truncated to 1 line
├── Meta: page count, file size, upload date
├── StatusBadge: processing (yellow), ready (green), error (red)
├── Actions: "Chat" button, "Generate Quiz" button, delete dropdown
└── Hover: shadow-md transition, cursor-pointer
```

### Quiz Components

#### `QuestionCard`
```
Location: components/quiz/question-card.tsx
Pattern: Compound component
Children: QuestionCard.Unanswered | QuestionCard.Review (shows correct/incorrect + explanation)
Props: { question: Question; selectedAnswer?: string; onAnswer: (answer: string) => void; showResult: boolean }

States:
├── Unanswered: all options clickable, neutral styling
├── Selected: selected option highlighted
├── Correct (after submit): green highlight + checkmark
├── Incorrect (after submit): red on wrong, green on correct + explanation
└── Explanation: Slide-in panel with source page reference
```

#### `ScoreCircle`
```
Location: components/quiz/score-circle.tsx
Props: { score: number; total: number; size?: number }

Rendering:
├── SVG circle with two rings
├── Background ring: muted color (full circle)
├── Progress ring: animated pathLength from 0 → score/total
├── Center: "{score}/{total}" in big bold text
├── Subtext: "{percentage}%" or "Passed!" / "Keep practicing"
└── Color: red (<40%), amber (40-70%), emerald (>70%)
```

#### `WeakTopicsChart`
```
Location: components/quiz/weak-topics-chart.tsx
Props: { topics: { topic: string; score: number }[] }

Rendering:
├── Horizontal bar chart using Recharts
├── Bars sorted by score (ascending — weakest first)
├── Color gradient: red → amber → green
└── Labels: topic name on left, percentage on right
```

### Room Components

#### `OnlineUsers`
```
Location: components/rooms/online-users.tsx
Props: { users: User[]; maxVisible?: number }

Rendering:
├── Horizontal avatar stack (overlapping)
├── Green dot on each avatar
├── "+N more" badge when overflow
└── Tooltip with full names on hover
```

### Layout Components

#### `DashboardShell`
```
Location: components/layout/dashboard-shell.tsx
Pattern: Compound component
Children: DashboardShell.Sidebar + DashboardShell.Navbar + DashboardShell.Content

Layout:
├── Desktop: Sidebar (w-64) fixed left + content area
├── Tablet: Collapsed sidebar (w-16 icons only)
├── Mobile: Sidebar as Sheet overlay triggered by hamburger
└── Navbar always visible at top
```

#### `Sidebar`
```
Location: components/layout/sidebar.tsx
Props: (none — uses pathname from usePathname())

Items:
├── Overview (LayoutDashboard icon)
├── Documents (FileText)
├── Chat (MessageSquare)
├── Quiz (Brain)
└── Study Rooms (Users)

Behavior:
├── Active item highlighted (bg-primary/10, text-primary)
├── Collapsible on tablet (icons only)
├── Sheet overlay on mobile
└── GitHub star badge at bottom (optional)
```

## Empty States

| Page | Illustration | Title | Description | Action |
|---|---|---|---|---|
| `/documents` | FileText + Upload | "No documents yet" | "Upload your first PDF to get started" | [Upload your first PDF] |
| `/chat/[id]` | MessageSquare | "Start a conversation" | "Ask anything about your course material" | (just type) |
| `/quiz` | Brain | "No quizzes yet" | "Generate a quiz from any document" | [Generate a quiz] |
| `/rooms` | Users | "No study rooms" | "Create or join a study room to collaborate" | [Create a room] |
| `/dashboard` | BarChart3 | "Welcome to StudyMate!" | "Upload a PDF and start learning smarter" | [Upload your first PDF] |

## Loading States

| Component | Loading UI |
|---|---|
| Document grid | 6 skeleton cards (h-48, animate-pulse) |
| Chat messages | 3 skeleton lines (different widths, animate-pulse) |
| Quiz questions | Skeleton question + 4 skeleton options |
| Dashboard stats | 4 skeleton stat cards |
| Room list | 3 skeleton cards (h-24) |
| Chat sidebar | 5 skeleton conversation items |
| Charts | Skeleton rectangle matching chart dimensions |
