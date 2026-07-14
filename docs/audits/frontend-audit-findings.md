# Frontend Audit Findings

This document outlines the findings from auditing the `apps/frontend/` codebase against the `docs/frontend/` documentation for the StudyMate-AI Next.js application.

## Compliant Features

The following aspects of the implementation successfully match the documentation:
- **Framework & Language**: Next.js 15 App Router and TypeScript 5.7 are being used.
- **Styling**: Tailwind CSS v4 is used for styling and theme tokens (`globals.css`).
- **Auth**: Clerk (`@clerk/nextjs`) is successfully integrated, including `middleware.ts` for route protection.
- **Core Routes**: The protected dashboard routes (`/dashboard`, `/documents`, `/chat`, `/quiz`, `/rooms`) are present.
- **State Libraries**: `zustand` and `swr` are installed and utilized for client state and server state respectively.
- **Streaming Logic**: Real-time streaming for chat is correctly implemented via SSE using `api.streamPost` in the API client and reading from `ReadableStream`.
- **Markdown & Charts**: `react-markdown`, `remark-gfm`, and `recharts` are present in `package.json`.

## Deviations

The following features are implemented, but their approach deviates from the architecture documented:

1. **Icons Library**: 
   - *Documented*: `lucide-react` (tree-shakeable SVGs).
   - *Implemented*: `@fortawesome/react-fontawesome` (FontAwesome). `lucide-react` is not present in the package dependencies.
2. **Component Architecture (Compound Components)**:
   - *Documented*: "Compound components" pattern to avoid boolean explosion (e.g., `<UploadZone.Idle>`, `<ChatInterface.Active>`).
   - *Implemented*: Components like `UploadZone` and `ChatInterface` rely on internal state switches (e.g. `UploadStateContent` switch) and standard conditional rendering.
3. **Data Fetching Strategy**:
   - *Documented*: Strict Server Component fetching via an `apiServer()` utility, passing `initialData` into Client Components (e.g., in `documents/page.tsx`) to eliminate waterfalls.
   - *Implemented*: Entire pages (like `documents/page.tsx`) are marked as `'use client'` and fetch data purely on the client side using `useDocuments` (SWR hook). `apiServer()` is completely missing from `lib/api-client.ts`.
4. **Zustand State Architecture**:
   - *Documented*: A comprehensive `useChatStore` handling `activeStreams`, `streamingMessages`, and chunk updates.
   - *Implemented*: The `chat-store.ts` only holds `conversations`. Streaming and message state is handled locally using `useState` within `chat-interface.tsx`.
5. **Layout Components Directory Structure**:
   - *Documented*: Layout-related components should reside in `components/layout/`.
   - *Implemented*: The `layout/` directory is missing. `dashboard-shell.tsx`, `sidebar.tsx`, and `navbar.tsx` are dumped directly in the root `components/` directory.
6. **Drag and Drop**:
   - *Documented*: Usage of `react-dropzone`.
   - *Implemented*: Custom HTML5 Drag-and-Drop is manually implemented in `upload-zone.tsx` without the library.
7. **Extra Dashboard Routes**:
   - *Implemented*: `analytics`, `tasks`, and `settings` folders exist under `(dashboard)` which were not originally specified in the `routing.md` docs.

## Missing Features

The following features were specified in the documentation but are entirely missing from the codebase:

1. **Missing Libraries (Not Installed)**:
   - `framer-motion`
   - `react-hook-form`
   - `zod`
   - `react-dropzone`
   - `rehype-highlight`
2. **Marketing Route Group & Pages**:
   - The `(marketing)` route group (for handling the public navbar and footer layout) is missing.
   - Specific marketing pages `/features`, `/privacy`, and `/terms` are not implemented as routes (though some components exist in `components/`).
3. **Incomplete shadcn/ui Installation**:
   - The documentation requires several CLI-generated primitives. The `components/ui/` directory is missing a large portion of them, including `card.tsx`, `dropdown-menu.tsx`, `progress.tsx`, `tooltip.tsx`, `tabs.tsx`, `sheet.tsx`, `separator.tsx`, `scroll-area.tsx`, and `command.tsx`.
