# Repository Guidelines

## Project Structure & Module Organization

StudyMate AI is a pnpm/Turborepo TypeScript monorepo. `apps/frontend` contains the Next.js App Router UI; place pages in `src/app`, reusable UI in `src/components`, client state in `src/store`, and hooks in `src/hooks`. `apps/backend` is the NestJS API, organized by feature modules under `src/` (for example, `tasks/`, `quiz/`, and `ai/`).

Shared contracts and constants belong in `packages/shared/src`. Database schema definitions, Drizzle configuration, and committed migrations live in `packages/db/src` and `packages/db/drizzle`. Keep architectural and setup material in `docs/`; container definitions are in `docker/`.

## Build, Test, and Development Commands

Use Node 20+ and pnpm 11+.

- `pnpm dev` — start all development tasks through Turborepo.
- `pnpm build` — build every workspace.
- `pnpm lint` and `pnpm typecheck` — run repository-wide static checks.
- `pnpm test` — run workspace Vitest suites.
- `pnpm --filter @studymate/frontend test:e2e` — run Playwright browser tests.
- `pnpm --filter @studymate/db db:generate` — generate a Drizzle migration after schema changes; follow with `db:migrate` to apply it.
- `pnpm format` — apply Prettier to supported source and documentation files.

## Coding Style & Naming Conventions

Use TypeScript throughout. Prettier governs formatting: two spaces, semicolons, single quotes, trailing commas, and a 100-character print width. Run `pnpm format` before committing. Respect the app-level ESLint configurations.

Name React components in PascalCase (`DocumentCard`), hooks with `use` and kebab-case filenames (`use-room-chat.ts`), and Nest feature files by responsibility (`tasks.service.ts`, `create-task.dto.ts`). Keep cross-application types in `@studymate/shared` rather than duplicating them.

## Testing Guidelines

Write focused Vitest unit or integration tests beside the implementation as `*.spec.ts`; backend end-to-end coverage uses `*.e2e-spec.ts`. Add or update tests when changing behavior, especially API contracts, AI services, and shared utilities. Run the smallest relevant suite locally, then `pnpm test`; there is no stated coverage threshold.

## Commit & Pull Request Guidelines

Follow the existing concise Conventional Commit style when applicable: `fix: ...`, `chore: ...`, or `docs: ...`. Keep each commit scoped to one coherent change. Pull requests should explain the user-visible or technical impact, link related issues, list verification commands, and include screenshots for frontend changes. Never commit `.env` files, credentials, or production connection strings; use the provided `.env.example` files.
