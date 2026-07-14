# Backend API & Shared Packages Audit Findings

## Overview
Audit of `apps/backend/` and `packages/shared/` against `docs/backend/` and `docs/shared/` to verify compliance with architectural, API, and validation documentation.

## Compliant Features
- **Architecture & Structure**: The application generally follows the documented NestJS module structure (`DocumentsModule`, `ChatModule`, `QuizModule`, etc.).
- **Dependency Injection**: Services correctly use dependency injection for database and external integrations.
- **Database**: The Drizzle ORM implementation matches the architectural expectations for data access.

## Deviations

1. **Error Formatting & Exceptions**
   - **Documentation**: Errors should follow the shape `{ status, message, errors: [] }`. `AllExceptionsFilter` passes known `HttpException` as-is and uses `Sentry` for unknowns.
   - **Implementation**: `AllExceptionsFilter` formats all exceptions as `{ statusCode, message, timestamp }` and does **not** use Sentry. `ZodValidationPipe` throws an array of errors into `BadRequestException`, which the exception filter incorrectly parses, resulting in only the first validation error object being returned inside the `message` field instead of an `errors` array.

2. **Response Interceptor & Pagination**
   - **Documentation**: `TransformInterceptor` wraps single items in `{ data: T }` and paginated items in `{ data: T[], meta: { total, page, limit, hasMore } }`.
   - **Implementation**: `TransformInterceptor` unconditionally wraps everything in `{ data, timestamp }`. No `meta` object or pagination details are returned for any list endpoints.

3. **Authentication & User Sync**
   - **Documentation**: `ClerkAuthGuard` syncs the user profile (email, name, avatar) on *every* request. User payload is the full Drizzle entity.
   - **Implementation**: The guard checks a memory cache (`UserCacheService`) first. It only synchronizes the user profile and increments `sessionCount` if it's a new day, optimizing away the per-request sync. The user payload is a simplified `CurrentUserPayload` type, not the full DB entity.

4. **Shared Types & Validation**
   - **Documentation**: Claims only `UploadUrlSchema` is in the shared package and others (like `SendMessageSchema`) are "aspirational" and not implemented. Claims the backend uses inline types without runtime validation for most routes.
   - **Implementation**: The shared package contains all the "aspirational" schemas (`CreateConversationSchema`, `GenerateQuizSchema`, etc.), and the NestJS controllers *actively use* them with `ZodValidationPipe`. This is a positive deviation where the code is more robust than documented.

5. **Shared Constants**
   - **Documentation**: `EMBEDDING_MODEL` = `text-embedding-004`, `CHAT_MODEL` = `gemini-2.0-flash`. Trust levels are `NEW, REGULAR, TRUSTED, CORE`. Personas are `EXPLORER, FOCUSED...`
   - **Implementation**: `EMBEDDING_MODEL` = `gemini-embedding-2`, `CHAT_MODEL` = `deepseek/deepseek-chat`. Trust levels are `STRANGER, ACQUAINTANCE...` Personas are `GUIDE, TUTOR...`

6. **Rate Limiting**
   - **Documentation**: Lists specific rate limits per endpoint group (e.g., Health 100/min, Chat 20/min).
   - **Implementation**: Uses a global `ThrottlerGuard` of 100 req/min across all routes.

7. **Documents API**
   - **Upload URL limit**: 10MB in the service logic vs 50MB in documentation.
   - `createUploadUrl` returns `{ id, uploadUrl, s3Key }` instead of `{ documentId, presignedUrl, s3Key, expiresIn }`.
   - `processDocument` expects a body (`ProcessDocumentSchema`) instead of being empty. It hardcodes the response `{ status: 'processing', message: 'Document processing queued' }` instead of returning the documented data structure.
   - `deleteDocument` returns `{ deleted: true }` instead of `{ data: { message: ... } }`.

8. **Chat API**
   - **Stream Message**: Route is `POST /api/chat/conversations/:id/message` (docs say `POST /api/chat/message`). Body expects `{ content }` and provider overrides instead of `{ conversationId, content, documentIds }`.
   - **SSE Format**: Backend yields raw JSON string tokens. It does not wrap events in `{"type": "token", "data": "..."}` as documented, nor does it emit `citation` or `done` events.

9. **Quiz API**
   - `generateQuiz`: Body takes `documentIds` (array) instead of `documentId` (string). Returns `{ id, questionCount }` instead of the full quiz structure.
   - `getQuiz`: **Security Leak** - Includes `correctAnswer` and `explanation` in the payload, which the docs state must be intentionally omitted until the attempt is submitted.
   - `submitAttempt`: API is split into two calls (`POST /api/quiz/:id/attempt` to start, `POST /api/quiz/:id/attempt/:attemptId/submit` to submit), instead of a single call.

10. **Rooms API & WebSockets**
    - `joinRoom` (HTTP): Route is `POST /api/rooms/:inviteCode/join` (no body) instead of `POST /api/rooms/:id/join` with `{ inviteCode }` body.
    - **WebSocket Gateway**: Event names and payloads differ significantly (`join:room` expects `{ roomId }` object instead of string, `message:send` instead of `room:message`). Does not maintain a global `roomUsers` state or emit `room:presence`; instead emits `user:joined`/`user:left` based on discrete `presence:update` events.

11. **Health API**
    - `GET /api/health`: Missing `uptime` in response.
    - `GET /api/ready`: Returns `checks: { database: 'ok', storage: 'ok', gemini: 'ok' }` instead of the documented string values like `'connected'` and `'reachable'`.

12. **Webhooks**
    - Does not use the official `svix` package to verify webhook signatures as implied by the docs, but uses manual `crypto.createHmac`.

## Missing Features
- **Pagination metadata**: Pagination metadata extraction is completely missing in `TransformInterceptor`. The meta object with `total`, `page`, `limit`, `hasMore` is never returned.
