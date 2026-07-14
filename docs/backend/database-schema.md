# Database Schema

## Overview

PostgreSQL with pgvector extension running on Supabase. All tables are managed via Drizzle ORM migrations.

## Entity-Relationship Diagram

```
users
  │
  ├── documents (1:N)
  │     │
  │     └── chunks (1:N) ──── vector(768) embedding (hnsw)
  │
  ├── conversations (1:N) ─── conversation_documents (N:M) ─── documents
  │     │
  │     └── messages (1:N) ──── jsonb citations
  │
  ├── quizzes (1:N) ───────── quiz_documents (N:M) ─────────── documents
  │     │
  │     ├── quiz_questions (1:N) ──── references chunks.id
  │     │
  │     └── quiz_attempts (1:N) ──── jsonb answers
  │
  ├── rooms (N:M via room_members)
  │     │
  │     └── room_messages (1:N)
  │
  ├── subjects (1:N)
  │     │
  │     ├── tasks (1:N)
  │     │
  │     └── study_sessions (1:N)
  │
  └── goals (1:N)
```

## Table Definitions

### `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | Internal primary key |
| `clerk_id` | `text` | `NOT NULL`, `UNIQUE` | Clerk user ID |
| `email` | `text` | `NOT NULL`, `UNIQUE` | User email |
| `name` | `text` | Nullable | Display name |
| `avatar_url` | `text` | Nullable | Profile image URL |
| `session_count` | `integer` | `NOT NULL`, `default 0` | Total study sessions |
| `last_active_at` | `timestamptz` | Nullable | |
| `metadata` | `jsonb` | `default {}` | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_clerk_id ON users (clerk_id);
```

---

### `documents`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `user_id` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Owner |
| `title` | `text` | `NOT NULL` | Document title |
| `file_name` | `text` | `NOT NULL` | Original filename |
| `file_size` | `integer` | `NOT NULL` | Size in bytes |
| `mime_type` | `text` | `NOT NULL` | MIME type |
| `s3_key` | `text` | `NOT NULL` | S3 object key |
| `status` | `document_status` | `NOT NULL`, `default 'pending'` | `pending` \| `processing` \| `ready` \| `error` |
| `page_count` | `integer` | Nullable | Number of PDF pages |
| `progress` | `integer` | `default 0` | Processing progress percentage |
| `is_pinned` | `boolean` | `NOT NULL`, `default false` | Pin state |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_documents_user_id ON documents (user_id);
CREATE INDEX idx_documents_status ON documents (status);
```

---

### `chunks`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `document_id` | `text` | `NOT NULL`, `FK → documents.id`, `ON DELETE CASCADE` | Parent document |
| `content` | `text` | `NOT NULL` | Chunk text content |
| `page_number` | `integer` | Nullable | Source PDF page |
| `heading` | `text` | Nullable | |
| `chunk_index` | `integer` | `NOT NULL` | Order within document |
| `token_count` | `integer` | `NOT NULL` | |
| `embedding` | `vector(768)` | Nullable | Gemini embedding vector |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_chunks_document_id ON chunks (document_id);
CREATE INDEX idx_chunks_content_gin ON chunks USING gin (to_tsvector('english', content));
CREATE INDEX idx_chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);
```

---

### `conversations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `user_id` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Owner |
| `title` | `text` | `NOT NULL` | |
| `is_pinned` | `boolean` | `NOT NULL`, `default false` | |
| `last_message_at` | `timestamptz` | Nullable | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_user_created ON conversations (user_id, created_at);
```

---

### `conversation_documents` (Junction Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `conversation_id` | `text` | `PK`, `FK → conversations.id`, `ON DELETE CASCADE` | |
| `document_id` | `text` | `PK`, `FK → documents.id`, `ON DELETE CASCADE` | |

---

### `messages`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `conversation_id` | `text` | `NOT NULL`, `FK → conversations.id`, `ON DELETE CASCADE` | Parent conversation |
| `role` | `message_role` | `NOT NULL` | `user` \| `assistant` \| `system` |
| `content` | `text` | `NOT NULL` | Message text in markdown |
| `citations` | `jsonb` | `default '[]'` | Array of citation objects |
| `token_count` | `integer` | Nullable | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_created_at ON messages (created_at);
```

---

### `quizzes`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `user_id` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Owner |
| `title` | `text` | `NOT NULL` | Auto-generated title |
| `difficulty` | `difficulty_level` | `NOT NULL` | `beginner` \| `intermediate` \| `advanced` |
| `question_count` | `integer` | `NOT NULL` | Number of questions |
| `time_limit` | `integer` | Nullable | Time limit in seconds |
| `is_pinned` | `boolean` | `NOT NULL`, `default false` | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_quizzes_user_id ON quizzes (user_id);
```

---

### `quiz_documents` (Junction Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `quiz_id` | `text` | `PK`, `FK → quizzes.id`, `ON DELETE CASCADE` | |
| `document_id` | `text` | `PK`, `FK → documents.id`, `ON DELETE CASCADE` | |

---

### `quiz_questions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `quiz_id` | `text` | `NOT NULL`, `FK → quizzes.id`, `ON DELETE CASCADE` | Parent quiz |
| `question` | `text` | `NOT NULL` | Question text |
| `options` | `jsonb` | `NOT NULL` | Array of `{label, text}` objects |
| `correct_answer` | `text` | `NOT NULL` | `A`, `B`, `C`, `D` |
| `explanation` | `text` | `NOT NULL` | Explanation of correct answer |
| `source_chunk_id` | `text` | `FK → chunks.id`, `ON DELETE SET NULL` | Source material |
| `order_index` | `integer` | `NOT NULL` | Position in quiz |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX idx_quiz_questions_source_chunk_id ON quiz_questions (source_chunk_id);
```

---

### `quiz_attempts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `user_id` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | User who attempted |
| `quiz_id` | `text` | `NOT NULL`, `FK → quizzes.id`, `ON DELETE CASCADE` | Quiz attempted |
| `score` | `integer` | `NOT NULL`, `default 0` | Correct answers |
| `total` | `integer` | `NOT NULL` | Total questions |
| `answers` | `jsonb` | `NOT NULL` | Array of answer objects |
| `started_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `completed_at` | `timestamptz` | Nullable | NULL if in progress |

**Indexes:**
```sql
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
```

---

### `rooms`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `name` | `text` | `NOT NULL` | Room display name |
| `invite_code` | `text` | `NOT NULL`, `UNIQUE` | Shareable join code |
| `created_by` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Creator |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_rooms_created_by ON rooms (created_by);
```

---

### `room_members`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `room_id` | `text` | `NOT NULL`, `FK → rooms.id`, `ON DELETE CASCADE` | |
| `user_id` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | |
| `role` | `member_role` | `NOT NULL`, `default 'member'` | `owner` \| `member` |
| `joined_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_room_members_room_id ON room_members (room_id);
CREATE INDEX idx_room_members_user_id ON room_members (user_id);
CREATE UNIQUE INDEX idx_room_members_room_user_unique ON room_members (room_id, user_id);
```

---

### `room_messages`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PK` | |
| `room_id` | `text` | `NOT NULL`, `FK → rooms.id`, `ON DELETE CASCADE` | |
| `user_id` | `text` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | |
| `content` | `text` | `NOT NULL` | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_room_messages_room_id ON room_messages (room_id);
CREATE INDEX idx_room_messages_created_at ON room_messages (created_at);
```

---

### `subjects`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK`, `default gen_random_uuid()` | |
| `user_id` | `text` | `NOT NULL` | String Clerk ID |
| `name` | `varchar(255)` | `NOT NULL` | |
| `color` | `varchar(50)` | Nullable | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `default now()` | |

---

### `tasks`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK`, `default gen_random_uuid()` | |
| `user_id` | `text` | `NOT NULL` | String Clerk ID |
| `subject_id` | `uuid` | `FK → subjects.id`, `ON DELETE SET NULL` | |
| `title` | `varchar(255)` | `NOT NULL` | |
| `description` | `text` | Nullable | |
| `status` | `varchar(50)` | `NOT NULL`, `default 'pending'` | |
| `due_date` | `timestamp` | Nullable | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `default now()` | |

---

### `study_sessions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK`, `default gen_random_uuid()` | |
| `user_id` | `text` | `NOT NULL` | String Clerk ID |
| `subject_id` | `uuid` | `FK → subjects.id`, `ON DELETE SET NULL` | |
| `task_id` | `uuid` | `FK → tasks.id`, `ON DELETE SET NULL` | |
| `duration_minutes` | `integer` | `NOT NULL` | |
| `type` | `varchar(50)` | `NOT NULL` | |
| `completed_at` | `timestamptz` | `NOT NULL`, `default now()` | |

---

### `goals`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK`, `default gen_random_uuid()` | |
| `user_id` | `text` | `NOT NULL` | String Clerk ID |
| `title` | `varchar(255)` | `NOT NULL` | |
| `target_hours` | `integer` | `NOT NULL` | |
| `current_hours` | `integer` | `NOT NULL`, `default 0` | |
| `deadline` | `timestamp` | Nullable | |
| `status` | `varchar(50)` | `NOT NULL`, `default 'active'` | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `default now()` | |

---

## Vector Search Query

The core RAG query using pgvector cosine similarity with HNSW:

```sql
SELECT
  id,
  content,
  page_number,
  heading,
  1 - (embedding <=> :query_embedding) AS similarity
FROM chunks
WHERE document_id = ANY(:document_ids)
ORDER BY embedding <=> :query_embedding
LIMIT 5;
```

## Migration Commands

```bash
# Generate a new migration after schema changes
pnpm --filter @studymate/db db:generate

# Apply pending migrations
pnpm --filter @studymate/db db:migrate

# Rollback last migration
pnpm --filter @studymate/db db:rollback

# Create seed data
pnpm --filter @studymate/db db:seed
```
