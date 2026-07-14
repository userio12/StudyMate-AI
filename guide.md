# Local Development Guide

## Option 1: Running the Whole Monorepo Together (Recommended)

StudyMate AI is built as a **Turborepo monorepo**. This means the frontend, backend, and database packages are all connected. To run the application properly locally without encountering connection errors (like `ECONNREFUSED`), you must start the entire system together.

### Step 1: Open a Terminal at the Project Root
Ensure your terminal is located at the root of the project, not inside `apps/frontend` or `apps/backend`.

```bash
# If you are currently in apps/frontend, navigate back up:
cd ../../

# Your path should now look like:
# ~/Downloads/Github-Projects/StudyMate-AI
```

### Step 2: Install Dependencies
If you haven't already verified your installations, run the install command at the root:
```bash
pnpm install
```

### Step 3: Start the Development Server
Run the root development script. Turborepo will automatically boot up both the **NestJS Backend** (port 4000) and the **Next.js Frontend** (port 3000) concurrently in watch mode.

```bash
pnpm dev
```

### Expected Output
You should see logs from both `@studymate/backend` and `@studymate/frontend` streaming in the same terminal side-by-side. 
- The backend will report `Nest application successfully started` (hosting on `http://localhost:4000`).
- The frontend will report `Ready in X.Xs` (hosting on `http://localhost:3000`).

### Troubleshooting `ECONNREFUSED`
If you ever see a `fetch failed` or `ECONNREFUSED` error on the frontend, it means the backend process either crashed or wasn't started. Always ensure `pnpm dev` is running from the root folder so both systems are alive and can communicate with each other!
