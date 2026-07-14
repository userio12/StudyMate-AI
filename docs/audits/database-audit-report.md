# Database Audit Report

This report highlights the discrepancies between the implemented Drizzle schema in `packages/db/src/schema/` and the official documentation in `docs/backend/database-schema.md`.

## 1. Undocumented Tables
The codebase contains the following tables which are **not** present in the documentation:
* `tasks`
* `study_sessions`
* `subjects`
* `goals`
* `conversation_documents` (Junction table)
* `quiz_documents` (Junction table)
* `room_messages`

## 2. Table Schema Discrepancies

### `users`
* **Extra in Code:** `sessionCount`, `lastActiveAt`, `metadata`.
* **Missing in Code:** None.

### `documents`
* **Extra in Code:** `fileName`, `mimeType`, `progress`, `isPinned`.
* **Missing in Code:** `error_message` (documented as text).

### `chunks`
* **Index Mismatch:** The documentation specifies an `ivfflat` index for the `embedding` vector. The code implementation uses an `hnsw` index. HNSW is generally faster and more accurate, so this is likely an intentional upgrade that wasn't documented.
* **Column Mismatch:** The docs specify a `metadata` jsonb column containing heading/subheading info. The code replaces this with a direct `heading` text column.

### `conversations`
* **Relationship Mismatch:** The docs define a 1:N relationship where `conversations` has a `document_id`. The codebase instead implements a many-to-many relationship using a `conversation_documents` junction table.
* **Extra in Code:** `isPinned`, `lastMessageAt`.

### `messages`
* **Type Mismatch:** Docs specify `role` as `varchar(20)`. The code strictly enforces it using a `pgEnum` (`'user', 'assistant', 'system'`).
* **Extra in Code:** `tokenCount`.

### `quizzes`
* **Relationship Mismatch:** The docs specify a `document_id`. The codebase implements a many-to-many relationship using a `quiz_documents` junction table.
* **Enum Mismatch:** The docs list difficulties as `'easy', 'medium', 'hard'`. The code uses an enum with `'beginner', 'intermediate', 'advanced'`.
* **Extra in Code:** `timeLimit`, `isPinned`.

### `quiz_questions`
* **Column Name Mismatch:** Docs use `order_index`. Code uses `order`.
* **Extra in Code:** `questionType` enum (`'multiple_choice', 'true_false', 'short_answer'`).

### `quiz_attempts`
* **Missing in Code:** `total` (documented as total questions).

### `rooms`
* **Missing in Code:** `description` text column.

### `room_members`
* **Enum Mismatch:** Docs list roles as `'admin', 'member'`. Code uses `'owner', 'member'`.

## User Review Required
> [!CAUTION]
> Significant differences exist! The codebase has evolved to include productivity features (tasks, goals, subjects) and many-to-many document relationships (allowing a single chat to reference multiple PDFs) that are entirely undocumented.
> 
> **Decision Required:**
> 1. **Option A (Recommended):** Update the `database-schema.md` documentation to reflect the current, more advanced state of the codebase.
> 2. **Option B:** Purge the extra tables and downgrade the codebase relationships to match the simpler markdown documentation.

How would you like to proceed?
