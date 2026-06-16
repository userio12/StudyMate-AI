# Frontend Overview

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 15 App Router | SSR for landing, client components for dashboard, file-based routing |
| **Language** | TypeScript 5.7 | Strict mode, full type safety |
| **Styling** | Tailwind CSS v4 | Utility-first, CSS variables for theming, JIT compilation |
| **UI Library** | shadcn/ui | Radix UI accessibility + customizable Tailwind components |
| **Animation** | Framer Motion | Declarative animations, layout animations, gesture support |
| **Icons** | Lucide React | Consistent SVG icons, tree-shakeable |
| **Charts** | Recharts | Declarative, composable chart components |
| **Forms** | React Hook Form + Zod | Performant, schema-driven validation |
| **State** | Zustand + SWR | Client state (Zustand) + server state (SWR) |
| **Auth** | Clerk (`@clerk/nextjs`) | SSR-safe, middleware-based protection |
| **Testing** | Vitest + Testing Library + Playwright | Unit, component, and E2E testing |

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (ClerkProvider, ThemeProvider)
│   │   ├── page.tsx                  # Landing page (SSR)
│   │   ├── globals.css               # Design tokens + Tailwind
│   │   ├── sitemap.ts                # SEO sitemap
│   │   ├── robots.ts                 # Robots.txt
│   │   ├── not-found.tsx             # Custom 404 page
│   │   ├── error.tsx                 # Error boundary
│   │   ├── loading.tsx               # Global loading state
│   │   ├── (marketing)/              # Public marketing pages
│   │   ├── (auth)/                   # Sign-in, sign-up (Clerk)
│   │   └── (dashboard)/              # Protected dashboard pages
│   ├── components/
│   │   ├── ui/                       # shadcn primitives (auto-generated)
│   │   ├── layout/                   # Dashboard shell, sidebar, navbar
│   │   ├── chat/                     # Chat interface components
│   │   ├── documents/                # Document management components
│   │   ├── quiz/                     # Quiz components
│   │   ├── rooms/                    # Study room components
│   │   └── landing/                  # Landing page sections
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # API client, utilities, types
│   ├── store/                        # Zustand stores
│   └── middleware.ts                 # Clerk middleware
├── .storybook/                       # Storybook configuration
├── stories/                          # Component stories
├── public/                           # Static assets
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── Dockerfile
└── package.json
```

## Available Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "test:e2e": "playwright test",
  "storybook": "storybook dev -p 6006",
  "storybook:build": "storybook build"
}
```

## Local Development

```bash
# 1. Start from monorepo root
pnpm dev

# Or run frontend independently:
pnpm --filter frontend dev

# Open in browser
open http://localhost:3000
```

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "@clerk/nextjs": "^6",
    "@radix-ui/*": "latest",
    "lucide-react": "^0.400",
    "framer-motion": "^11",
    "recharts": "^2",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^3",
    "react-dropzone": "^14",
    "react-markdown": "^9",
    "rehype-highlight": "^7",
    "remark-gfm": "^4",
    "sonner": "^1",
    "next-themes": "^0.4",
    "zustand": "^5",
    "swr": "^2",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "class-variance-authority": "^0.7",
    "@studymate/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^19",
    "typescript": "^5.7",
    "tailwindcss": "^4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "vitest": "^3",
    "@testing-library/react": "^16",
    "@testing-library/jest-dom": "^6",
    "@playwright/test": "^1.50",
    "storybook": "^8",
    "@storybook/nextjs": "^8"
  }
}
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx    # Product analytics
NEXT_PUBLIC_SENTRY_DSN=https://...  # Error tracking
```

## Build & Deploy

The frontend deploys to **Vercel** with zero configuration:

```bash
# Build for production
pnpm --filter frontend build

# Deploy to Vercel
npx vercel --prod

# Or connect GitHub repo in Vercel dashboard:
# - Root directory: apps/frontend
# - Build command: cd ../.. && pnpm build --filter frontend
# - Output directory: .next
```
