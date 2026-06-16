# StudyMate AI

[![CI](https://github.com/userio12/StudyMate-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/userio12/StudyMate-AI/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=userio12_StudyMate-AI&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=userio12_StudyMate-AI)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=userio12_StudyMate-AI&metric=coverage)](https://sonarcloud.io/summary/new_code?id=userio12_StudyMate-AI)

Your AI-powered study companion — upload PDFs, chat with citations, and generate adaptive quizzes.

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

## Stack

- **Backend**: NestJS + PostgreSQL (pgvector) + Gemini AI
- **Frontend**: Next.js 15 App Router + Tailwind CSS v4
- **Auth**: Clerk
- **Storage**: AWS S3
- **CI**: GitHub Actions + SonarCloud + CodeRabbit

## Docs

See [docs/](docs/) for full documentation.
