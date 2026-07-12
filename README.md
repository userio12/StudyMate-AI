# StudyMate AI 🎓✨

StudyMate AI is a comprehensive, AI-powered study platform built to revolutionize how you learn from your documents. 

By uploading study materials (PDFs), you unlock a suite of intelligent features: engaging in context-aware chat with precise source citations, identifying weak topics automatically, and generating adaptive quizzes based on the knowledge embedded within your own documents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **🧠 Context-Aware AI Chat:** Ask questions about your study materials and receive accurate answers powered by Google Gemini, complete with page citations pointing exactly to the source context in your PDFs.
- **📊 Adaptive Quizzes:** Automatically generate multi-choice quizzes customized from your uploaded documents to test your retention and target weak areas.
- **📚 Smart Document Processing:** Upload and parse complex PDFs using advanced text extraction. Text is chunked, embedded via `pgvector`, and stored for semantic search (RAG).
- **🤝 Real-Time Study Rooms:** Collaborate with friends or classmates in real-time study rooms using WebSockets.
- **💡 Rich Dashboard Analytics:** Track your learning progression over time, see your most problematic topics, and monitor your study habits via dynamic data visualization.

## 🏗️ Architecture

StudyMate AI is engineered as a modern full-stack monorepo powered by **Turborepo** and **pnpm**.

- **Frontend (`apps/frontend`)**: Next.js 15 (App Router), Tailwind CSS v4, React 19, Framer Motion, Recharts.
- **Backend (`apps/backend`)**: NestJS, Socket.IO, Google Gemini integrations, AI orchestration (RAG).
- **Database (`packages/db`)**: PostgreSQL with `pgvector` for semantic search, managed via Drizzle ORM.
- **Shared (`packages/shared`)**: Shared types, Zod validation schemas, and common constants used across front/back applications.
- **Auth & Storage**: Clerk for identity management, AWS S3 (via presigned URLs) for document storage.

## 🚀 Quick Start & Setup

To get StudyMate AI running on your local machine, please follow our comprehensive **[Setup Guide](docs/SETUP.md)**.

## 📂 Project Structure

```text
StudyMate-AI/
├── apps/
│   ├── backend/          # NestJS application (API, AI services, WebSockets)
│   └── frontend/         # Next.js application (UI, dashboard, chat interface)
├── packages/
│   ├── db/               # Database schema, migrations, and Drizzle client
│   └── shared/           # Common types, Zod schemas, and constants
├── docs/                 # Documentation (Setup, Architecture, Diagrams)
├── docker/               # Containerization configurations (Local DB)
└── turbo.json            # Turborepo pipeline definition
```

## 🧪 Testing

We employ rigorous testing strategies across the stack:
- **Unit & Integration:** Run with `pnpm test` via Vitest.
- **End-to-End (E2E):** Handled via Playwright.

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request. Be sure to check the code style via `pnpm lint` and `pnpm typecheck` before submitting.

## 📄 License

StudyMate AI is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
