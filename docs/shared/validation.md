# Validation Schemas (@studymate/shared)

Currently, only one Zod validation schema lives in the shared package. All other validation is done inline in NestJS controllers or via the global `ValidationPipe`.

## Schemas in Shared Package

### UploadUrlSchema (used by backend documents controller)

```typescript
import { z } from 'zod';

export const UploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf']),
  fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB
});
```

**Usage in backend:**
```typescript
// documents/dto/create-upload-url.dto.ts — re-exports from shared
export const CreateUploadUrlSchema = UploadUrlSchema;

// documents.controller.ts
@Post('upload-url')
async createUploadUrl(
  @Body(new ZodValidationPipe(CreateUploadUrlSchema)) body: CreateUploadUrlDto,
) { ... }
```

## Validation in Backend (NestJS)

### Global ValidationPipe `apps/backend/src/main.ts`
A `ValidationPipe` is registered globally with `transform: true` and `whitelist: true`. This validates all incoming `@Body()`, `@Query()`, and `@Param()` decorators against TypeScript types (using `class-validator` under the hood for DTOs).

### ZodValidationPipe `apps/backend/src/common/pipes/`
```typescript
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    return result.data;
  }
}
```

Used only on the `POST /api/documents/upload-url` endpoint currently.

### Controllers without validation

The following endpoints accept `@Body()` with inline TypeScript types but no runtime validation:

| Endpoint | Body Type | Validated? |
|---|---|---|
| `POST /chat/conversations` | `{ title, documentIds? }` | No |
| `POST /chat/conversations/:id/message` | `{ content }` | No |
| `POST /quiz/generate` | `{ documentIds, difficulty, questionCount? }` | No |
| `POST /quiz/:id/submit` | `{ answers }` | No |
| `POST /rooms` | `{ name }` | No |

## Validation in Frontend

**Zero Zod usage in the frontend.** No form validation schemas exist. The frontend relies on:
- Native HTML5 validation (`required`, `maxLength`, `type="number"`, etc.)
- Manual checks in event handlers (e.g., empty message checks in `ChatInput`)

React Hook Form is installed as a dependency but not used. `@hookform/resolvers` is not installed.

## Aspirational Schemas (not yet implemented)

The following schemas are described in old documentation but do not exist in the codebase. They should be created in `@studymate/shared` when input validation is added to the relevant endpoints:

- `SendMessageSchema` — content length, conversationId format
- `CreateConversationSchema` — title length
- `GenerateQuizSchema` — documentIds, difficulty enum, questionCount range
- `SubmitAttemptSchema` — answer format validation
- `CreateRoomSchema` — room name length
- `JoinRoomSchema` — inviteCode format
