# StudyMate AI - Setup Guide 🚀

This guide provides step-by-step instructions for setting up StudyMate AI on your local machine for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 20.0.0 or higher.
- **pnpm**: Version 9.0.0 or higher (`npm install -g pnpm`).
- **Docker**: For running the local PostgreSQL database (with `pgvector`).
- **Git**: For version control.

You will also need active accounts for the following services (free tiers are sufficient):
- **Clerk**: For authentication.
- **OpenRouter / Google AI Studio**: For AI API keys (multi-provider orchestrator).
- **Supabase**: For PostgreSQL database (pgvector) and Supabase Storage.

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/StudyMate-AI.git
   cd StudyMate-AI
   ```

2. **Install Dependencies**
   Run the following command at the root of the project to install all monorepo dependencies:
   ```bash
   pnpm install
   ```

## ⚙️ Environment Configuration

You need to set up environment variables for the frontend, backend, and database packages.

1. **Frontend (`apps/frontend/.env.local`)**
   Create the file and populate it with your Clerk keys and backend URL:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

2. **Backend (`apps/backend/.env`)**
   Create the file and add your database URL, API keys, Supabase credentials, and Clerk keys:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studymate
   OPENROUTER_API_KEY=sk-or-v1-...
   GEMINI_API_KEY=your_gemini_api_key_here
   NVIDIA_API_KEY=nvapi-...
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJh...
   SUPABASE_STORAGE_BUCKET=studymate-ai-uploads
   CLERK_SECRET_KEY=sk_test_...
   FRONTEND_URL=http://localhost:3000
   ```

3. **Database (`packages/db/.env`)**
   Create the file for local Drizzle tooling:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studymate
   ```

## 🐳 Database Setup

We use Docker to spin up a PostgreSQL instance pre-configured with the `pgvector` extension required for semantic search (RAG).

1. **Start the Database Container**
   From the root folder, navigate to docker or run Docker compose directly:
   ```bash
   cd docker
   docker-compose up -d
   cd ..
   ```

2. **Run Migrations**
   Push the Drizzle ORM schema to your fresh local database:
   ```bash
   pnpm --filter @studymate/db db:push
   ```
   *(Optional)* To view your local database visually:
   ```bash
   pnpm --filter @studymate/db db:studio
   ```

## 🏃‍♂️ Running the Application

With your dependencies installed, environment configured, and database running, you can boot the entire stack.

1. **Start Development Mode**
   From the root directory, start all apps and packages in watch mode using Turborepo:
   ```bash
   pnpm dev
   ```

2. **Access the Apps**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4000/api
   - **Backend Swagger UI**: http://localhost:4000/api/docs (if enabled)

## 🧪 Running Tests

Ensure code quality by running the test suites:
- **Unit & Integration tests (Vitest)**:
  ```bash
  pnpm test
  ```
- **Type Checking**:
  ```bash
  pnpm typecheck
  ```
- **Linting**:
  ```bash
  pnpm lint
  ```

---
*Happy studying and building! ✨*
