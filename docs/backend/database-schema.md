# Database Schema

## Overview

PostgreSQL with pgvector extension running on Supabase. All tables are managed via Drizzle ORM migrations.

## Entity-Relationship Diagram

```
users
  │
  ├── documents (1:N)
  │     │
  │     └── chunks (1:N) ──── vector(768) embedding
  │
  ├── conversations (1:N)
  │     │
  │     └── messages (1:N) ──── jsonb citations
  │
  ├── quizzes (1:N)
  │     │
  │     ├── quiz_questions (1:N) ──── references chunks.sourceChunkId
  │     │
  │     └── quiz_attempts (1:N) ──── jsonb answers
  │
  └── rooms (N:M via room_members)
        │
        └── room_messages (1:N)
```

## Table Definitions

### `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK`, `default gen_random_uuid()` | Internal primary key |
| `clerk_id` | `varchar(255)` | `NOT NULL`, `UNIQUE` | Clerk user ID |
| `email` | `varchar(255)` | `NOT NULL` | User email |
| `name` | `varchar(255)` | `NOT NULL` | Display name |
| `avatar_url` | `varchar(512)` | Nullable | Profile image URL |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `auto-update` | |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_clerk_id ON users (clerk_id);
CREATE INDEX idx_users_email ON users (email);
```

---

### `documents`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Owner |
| `title` | `varchar(255)` | `NOT NULL` | Original filename |
| `s3_key` | `varchar(512)` | `NOT NULL` | S3 object key |
| `file_size` | `integer` | Nullable | Size in bytes |
| `page_count` | `integer` | Nullable | Number of PDF pages |
| `status` | `varchar(20)` | `NOT NULL`, `default 'processing'` | `processing` | `ready` | `error` |
| `error_message` | `text` | Nullable | Error details if status=error |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `auto-update` | |

**Indexes:**
```sql
CREATE INDEX idx_documents_user_id ON documents (user_id);
CREATE INDEX idx_documents_status ON documents (status);
CREATE INDEX idx_documents_user_status ON documents (user_id, status);
```

---

### `chunks`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `document_id` | `uuid` | `NOT NULL`, `FK → documents.id`, `ON DELETE CASCADE` | Parent document |
| `content` | `text` | `NOT NULL` | Chunk text content |
| `embedding` | `vector(768)` | `NOT NULL` | Gemini embedding vector |
| `page_number` | `integer` | Nullable | Source PDF page |
| `chunk_index` | `integer` | `NOT NULL` | Order within document |
| `metadata` | `jsonb` | `NOT NULL`, `default '{}'` | Heading, section hierarchy |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
-- Vector similarity search index (IVFFlat with 100 lists)
CREATE INDEX idx_chunks_embedding ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Filter by document for search scoping
CREATE INDEX idx_chunks_document_id ON chunks (document_id);

-- Full-text search for keyword fallback
CREATE INDEX idx_chunks_content_fts ON chunks
  USING gin (to_tsvector('english', content));
```

**Sample `metadata` JSON:**
```json
{
  "heading": "Chapter 3: Neural Networks",
  "subheading": "3.1 Backpropagation",
  "tokenCount": 480,
  "pageRange": [42, 43]
}
```

---

### `conversations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Owner |
| `document_id` | `uuid` | `FK → documents.id`, `ON DELETE SET NULL` | Optional linked doc |
| `title` | `varchar(255)` | `NOT NULL`, `default 'New Conversation'` | |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `auto-update` | |

**Indexes:**
```sql
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_updated ON conversations (user_id, updated_at DESC);
```

---

### `messages`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `conversation_id` | `uuid` | `NOT NULL`, `FK → conversations.id`, `ON DELETE CASCADE` | Parent conversation |
| `role` | `varchar(20)` | `NOT NULL` | `user` | `assistant` |
| `content` | `text` | `NOT NULL` | Message text in markdown |
| `citations` | `jsonb` | `NOT NULL`, `default '[]'` | Array of citation objects |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_created ON messages (conversation_id, created_at);
```

**Sample `citations` JSON:**
```json
[
  {
    "chunkId": "chunk-042-...",
    "pageNumber": 42,
    "excerpt": "Backpropagation computes the gradient of the loss function..."
  }
]
```

---

### `quizzes`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Owner |
| `document_id` | `uuid` | `NOT NULL`, `FK → documents.id`, `ON DELETE CASCADE` | Source document |
| `title` | `varchar(255)` | `NOT NULL` | Auto-generated title |
| `difficulty` | `varchar(20)` | `NOT NULL`, `default 'medium'` | `easy` | `medium` | `hard` |
| `question_count` | `integer` | `NOT NULL`, `default 5` | Number of questions |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

---

### `quiz_questions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `quiz_id` | `uuid` | `NOT NULL`, `FK → quizzes.id`, `ON DELETE CASCADE` | Parent quiz |
| `question` | `text` | `NOT NULL` | Question text |
| `options` | `jsonb` | `NOT NULL` | Array of `{label, text}` objects |
| `correct_answer` | `varchar(1)` | `NOT NULL` | `A` | `B` | `C` | `D` |
| `explanation` | `text` | `NOT NULL` | Explanation of correct answer |
| `source_chunk_id` | `uuid` | `FK → chunks.id`, `ON DELETE SET NULL` | Source material |
| `order_index` | `integer` | `NOT NULL` | Position in quiz |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX idx_quiz_questions_source ON quiz_questions (source_chunk_id);
```

**Sample `options` JSON:**
```json
[
  { "label": "A", "text": "Initialize network weights" },
  { "label": "B", "text": "Compute gradients via the chain rule" },
  { "label": "C", "text": "Apply activation functions" },
  { "label": "D", "text": "Normalize input data" }
]
```

---

### `quiz_attempts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `user_id` | `uuid` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | User who attempted |
| `quiz_id` | `uuid` | `NOT NULL`, `FK → quizzes.id`, `ON DELETE CASCADE` | Quiz attempted |
| `score` | `integer` | `NOT NULL`, `default 0` | Correct answers |
| `total` | `integer` | `NOT NULL` | Total questions |
| `answers` | `jsonb` | `NOT NULL` | Array of answer objects |
| `started_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `completed_at` | `timestamptz` | Nullable | NULL if in progress |

**Indexes:**
```sql
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts (quiz_id);
CREATE INDEX idx_quiz_attempts_user_score ON quiz_attempts (user_id, score DESC);
```

**Sample `answers` JSON:**
```json
[
  { "questionId": "q-001-...", "selectedAnswer": "B", "isCorrect": true },
  { "questionId": "q-002-...", "selectedAnswer": "A", "isCorrect": false }
]
```

---

### `rooms`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `name` | `varchar(255)` | `NOT NULL` | Room display name |
| `description` | `text` | Nullable | Room purpose |
| `created_by` | `uuid` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | Creator |
| `invite_code` | `varchar(50)` | `NOT NULL`, `UNIQUE` | Shareable join code |
| `created_at` | `timestamptz` | `NOT NULL`, `default now()` | |
| `updated_at` | `timestamptz` | `NOT NULL`, `auto-update` | |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_rooms_invite_code ON rooms (invite_code);
```

---

### `room_members`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PK` | |
| `room_id` | `uuid` | `NOT NULL`, `FK → rooms.id`, `ON DELETE CASCADE` | |
| `user_id` | `uuid` | `NOT NULL`, `FK → users.id`, `ON DELETE CASCADE` | |
| `role` | `varchar(20)` | `NOT NULL`, `default 'member'` | `admin` | `member` |
| `joined_at` | `timestamptz` | `NOT NULL`, `default now()` | |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_room_members_unique ON room_members (room_id, user_id);
CREATE INDEX idx_room_members_user ON room_members (user_id);
```

---

## Vector Search Query

The core RAG query using pgvector cosine similarity:

```sql
SELECT
  id,
  content,
  page_number,
  metadata,
  1 - (embedding <=> :query_embedding) AS similarity
FROM chunks
WHERE document_id = ANY(:document_ids)
ORDER BY embedding <=> :query_embedding
LIMIT 5;
```

Hybrid search (vector + keyword) with Reciprocal Ranked Fusion (RRF):

```sql
WITH vector_results AS (
  SELECT id, content, page_number,
    1 - (embedding <=> :query_embedding) AS score
  FROM chunks
  WHERE document_id = ANY(:document_ids)
  ORDER BY embedding <=> :query_embedding
  LIMIT 20
),
keyword_results AS (
  SELECT id, content, page_number,
    ts_rank(to_tsvector('english', content),
            plainto_tsquery('english', :query_text)) AS score
  FROM chunks
  WHERE document_id = ANY(:document_ids)
    AND to_tsvector('english', content) @@ plainto_tsquery('english', :query_text)
  ORDER BY score DESC
  LIMIT 20
),
rrf AS (
  SELECT id, content, page_number,
    COALESCE(1.0 / (60 + ROW_NUMBER() OVER (ORDER BY v.score DESC)), 0) +
    COALESCE(1.0 / (60 + ROW_NUMBER() OVER (ORDER BY k.score DESC)), 0) AS rrf_score
  FROM vector_results v
  FULL OUTER JOIN keyword_results k USING (id)
)
SELECT * FROM rrf
ORDER BY rrf_score DESC
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
