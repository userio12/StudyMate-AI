# Contributing to the Backend

## Code Style

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Classes** | PascalCase | `DocumentsService` |
| **Functions** | camelCase | `findAll()` |
| **Variables** | camelCase | `documentList` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Files** | kebab-case | `documents.controller.ts` |
| **DTOs** | PascalCase + Dto suffix | `UploadUrlDto` |
| **Interfaces** | PascalCase | `Document` |
| **Types** | PascalCase | `DocumentStatus` |
| **Enums** | PascalCase | `DocumentStatus` |
| **Enum values** | UPPER_SNAKE_CASE | `PROCESSING` |

### NestJS Conventions

- Controllers: `@Controller('documents')` (plural, lowercase)
- Routes: `@Get(':id')` (lowercase, hyphenated for multi-word)
- Services: Single responsibility, inject dependencies via constructor
- Modules: One per feature, export services for cross-module use
- DTOs: One file per DTO or related group

### Import Order

```typescript
// 1. Node built-ins
import { Readable } from 'stream';

// 2. Third-party
import { Injectable } from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';

// 3. Internal modules
import { DatabaseService } from '@studymate/db';
import { type User } from '@studymate/shared';

// 4. Relative imports
import { DocumentsService } from './documents.service';
import { UploadUrlDto } from './dto/upload-url.dto';
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage |
|---|---|
| `feat` | New feature (API endpoint, service, integration) |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons (no code change) |
| `refactor` | Code change that neither fixes nor adds |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependencies, CI |
| `perf` | Performance improvement |

### Scopes

| Scope | Area |
|---|---|
| `documents` | Document module |
| `chat` | Chat module + RAG |
| `quiz` | Quiz module |
| `rooms` | Rooms + WebSocket |
| `ai` | AI services (embeddings, LLM, PDF) |
| `auth` | Authentication + guards |
| `storage` | S3 storage |
| `db` | Database schema + migrations |
| `infra` | Docker, CI, deployment |

### Examples

```
feat(chat): implement SSE streaming with citation extraction

- Add ChatLlmService with Gemini streaming
- Parse [citation:N] markers from response
- Stream token and citation events to client

Closes #42
```

```
fix(documents): handle empty PDF gracefully

Prevents crash when user uploads a PDF with no extractable text.
Returns 'error' status with descriptive message instead.

Fixes #87
```

```
chore(infra): add Docker Compose for local development
```

## Pull Request Process

1. **Create a branch**: `feat/chat-streaming`, `fix/document-empty-pdf`, etc.
2. **Make changes** following the code style and commit conventions.
3. **Run checks locally**:
   ```bash
   pnpm --filter backend lint
   pnpm --filter backend typecheck
   pnpm --filter backend test
   pnpm --filter backend build
   ```
4. **Push and open a PR** with a clear title and description.
5. **PR template**:
   ```markdown
   ## Description
   Brief description of the changes.

   ## Related Issue
   Closes #42

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] E2E tests added/updated
   - [ ] Tested manually

   ## Screenshots
   (if applicable)
   ```
6. **Code review**: At least one approval required before merging.
7. **Merge**: Squash and merge into `main`.

## Adding a New Module

```bash
# 1. Generate the module
nest g module modules/my-feature
nest g controller modules/my-feature
nest g service modules/my-feature

# 2. Create DTOs directory
mkdir src/modules/my-feature/dto

# 3. Register in AppModule
@Module({
  imports: [MyFeatureModule],
})
export class AppModule {}

# 4. Add database schema
# In packages/db/src/schema/
export const myFeature = pgTable('my_feature', { ... });

# 5. Generate migration
pnpm db:generate

# 6. Add API docs with Swagger decorators
@ApiTags('My Feature')
@Controller('my-feature')
export class MyFeatureController { ... }
```

## Error Handling Guidelines

```typescript
// DO: Use NestJS HTTP exceptions
throw new NotFoundException('Document not found');
throw new BadRequestException('Invalid file type');

// DO NOT: Return raw error objects
return { error: 'Not found' }; // ✗

// DO: Validate at the controller boundary with Zod pipes
@Body(new ZodValidationPipe(UploadUrlSchema)) body: UploadUrlDto

// DO: Catch and log unexpected errors
try {
  await riskyOperation();
} catch (error) {
  this.logger.error('Operation failed', error.stack);
  throw new InternalServerErrorException('Something went wrong');
}
```

## Database Guidelines

```typescript
// DO: Use parameterized queries (Drizzle handles this)
await db.insert(documents).values({ userId, title });

// DO: Wrap related operations in transactions
await db.transaction(async (tx) => {
  await tx.insert(documents).values({ ... });
  await tx.insert(chunks).values(chunksList);
});

// DO NOT: Use raw string interpolation
await db.execute(`SELECT * FROM documents WHERE id = ${id}`); // ✗

// DO: Add indexes for query patterns
// See database-schema.md for index conventions
```

## Testing Guidelines

```typescript
// DO: Use descriptive test names
it('should return 404 when document does not exist', async () => { ... });

// DO: Test edge cases
it('should handle empty document list', async () => { ... });
it('should reject files over 50MB', async () => { ... });

// DO: Use mocks for external services
const mockStorage = { generateUploadUrl: jest.fn().mockResolvedValue(...) };

// DO NOT: Test implementation details
it('should call database with correct args', ...); // Fragile

// DO: Test behavior and outcomes
it('should return paginated documents', ...); // Robust
```

## Getting Help

- Check existing docs in `/docs/backend/`
- Look at similar existing modules for patterns
- Open a discussion or issue on GitHub
