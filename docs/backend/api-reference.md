# API Reference

Base URL: `http://localhost:4000/api` (development)  
Auth: `Authorization: Bearer <clerk_session_token>` (all endpoints except health)

## Health

### `GET /api/health`

Liveness probe. Returns 200 when the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-14T10:00:00Z",
  "uptime": 3600
}
```

### `GET /api/ready`

Readiness probe. Returns 200 when the server can accept traffic (DB connected, external services reachable).

**Response:**
```json
{
  "status": "ok",
  "checks": {
    "database": "connected",
    "storage": "reachable",
    "ai": "reachable"
  }
}
```

---

## Documents

### `POST /api/documents/upload-url`

Get a presigned S3 URL for direct file upload.

**Request Body:**
```json
{
  "fileName": "machine-learning-notes.pdf",
  "contentType": "application/pdf",
  "fileSize": 10485760
}
```

**Validation:**
- `fileName`: 1-255 characters
- `contentType`: must be `application/pdf`
- `fileSize`: max 50MB (52,428,800 bytes)

**Response (201):**
```json
{
  "data": {
    "documentId": "a1b2c3d4-...",
    "presignedUrl": "https://studymate-ai-uploads.s3.amazonaws.com/.../ml-notes.pdf?X-Amz-Signature=...",
    "s3Key": "uploads/user_abc/ml-notes.pdf",
    "expiresIn": 300
  }
}
```

---

### `POST /api/documents/:id/process`

Start the PDF processing pipeline (extract → chunk → embed → store).

**Path Parameters:**
- `id`: UUID of the document (from upload-url response)

**Response (202):**
```json
{
  "data": {
    "documentId": "a1b2c3d4-...",
    "status": "processing",
    "message": "PDF processing started"
  }
}
```

**Errors:**
- `404`: Document not found or not owned by user
- `409`: Document already processed or currently processing
- `400`: Invalid document (empty file, corrupted PDF)

---

### `GET /api/documents`

List all documents for the authenticated user.

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `status` | string | — | Filter by status: `processing`, `ready`, `error` |
| `sort` | string | `createdAt` | Sort field |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

**Response (200):**
```json
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "title": "machine-learning-notes.pdf",
      "fileSize": 10485760,
      "pageCount": 128,
      "status": "ready",
      "createdAt": "2026-06-14T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

---

### `GET /api/documents/:id`

Get a single document's details.

**Response (200):**
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "title": "machine-learning-notes.pdf",
    "fileSize": 10485760,
    "pageCount": 128,
    "status": "ready",
    "chunkCount": 245,
    "createdAt": "2026-06-14T10:00:00Z",
    "updatedAt": "2026-06-14T10:02:00Z"
  }
}
```

---

### `DELETE /api/documents/:id`

Delete a document and all associated chunks, conversations, and quizzes.

**Response (200):**
```json
{
  "data": {
    "message": "Document deleted successfully"
  }
}
```

---

## Chat

### `POST /api/chat/conversations`

Create a new conversation.

**Request Body:**
```json
{
  "title": "Machine Learning Questions",
  "documentId": "a1b2c3d4-..."
}
```

**Response (201):**
```json
{
  "data": {
    "id": "conv-001-...",
    "title": "Machine Learning Questions",
    "documentId": "a1b2c3d4-...",
    "messageCount": 0,
    "createdAt": "2026-06-14T10:00:00Z"
  }
}
```

---

### `GET /api/chat/conversations`

List conversations, ordered by last message time.

**Response (200):**
```json
{
  "data": [
    {
      "id": "conv-001-...",
      "title": "Machine Learning Questions",
      "documentTitle": "ml-notes.pdf",
      "messageCount": 12,
      "lastMessageAt": "2026-06-14T10:30:00Z",
      "createdAt": "2026-06-14T10:00:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

---

### `GET /api/chat/conversations/:id`

Get conversation with full message history.

**Response (200):**
```json
{
  "data": {
    "id": "conv-001-...",
    "title": "Machine Learning Questions",
    "messages": [
      {
        "id": "msg-001-...",
        "role": "user",
        "content": "What is backpropagation?",
        "createdAt": "2026-06-14T10:05:00Z"
      },
      {
        "id": "msg-002-...",
        "role": "assistant",
        "content": "Backpropagation is **an algorithm** that computes gradients... [citation:0][citation:1]",
        "citations": [
          {
            "chunkId": "chunk-042-...",
            "pageNumber": 42,
            "excerpt": "Backpropagation computes the gradient of the loss function..."
          },
          {
            "chunkId": "chunk-043-...",
            "pageNumber": 43,
            "excerpt": "Each weight is updated proportionally to its contribution..."
          }
        ],
        "createdAt": "2026-06-14T10:05:02Z"
      }
    ]
  }
}
```

---

### `POST /api/chat/message`

Send a message and receive an SSE stream with the assistant's response.

**Request Body:**
```json
{
  "conversationId": "conv-001-...",
  "content": "Explain how CNNs work",
  "documentIds": ["a1b2c3d4-..."]
}
```

**Response:** SSE stream with events:

```
event: token
data: {"type":"token","data":"Convolutional"}

event: token
data: {"type":"token","data":" Neural"}

event: token
data: {"type":"token","data":" Networks"}

...

event: citation
data: {"type":"citation","data":{"index":0,"pageNumber":55,"excerpt":"A CNN consists of convolutional layers..."}}

event: citation
data: {"type":"citation","data":{"index":1,"pageNumber":57,"excerpt":"Pooling layers reduce spatial dimensions..."}}

event: done
data: {"type":"done","data":{"messageId":"msg-003-...","totalTokens":342}}
```

**Client consumption (JavaScript/TypeScript):**
```typescript
const response = await fetch(`${API_URL}/api/chat/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ conversationId, content, documentIds }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

let assistantContent = '';
const citations: Citation[] = [];

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

  for (const line of lines) {
    const event = JSON.parse(line.slice(6));
    switch (event.type) {
      case 'token':
        assistantContent += event.data;
        updateUI(assistantContent);
        break;
      case 'citation':
        citations.push(event.data);
        showCitationBadge(event.data);
        break;
      case 'done':
        finalizeMessage(assistantContent, citations);
        break;
    }
  }
}
```

---

### `DELETE /api/chat/conversations/:id`

Delete a conversation and all its messages.

---

## Quiz

### `POST /api/quiz/generate`

Generate a quiz from a document's content.

**Request Body:**
```json
{
  "documentId": "a1b2c3d4-...",
  "questionCount": 5,
  "difficulty": "medium"
}
```

**Validation:**
- `questionCount`: 1-20
- `difficulty`: `easy` | `medium` | `hard`

**Response (201):**
```json
{
  "data": {
    "id": "quiz-001-...",
    "title": "Machine Learning Fundamentals",
    "difficulty": "medium",
    "questionCount": 5,
    "createdAt": "2026-06-14T11:00:00Z",
    "questions": [
      {
        "id": "q-001-...",
        "question": "What is the primary purpose of backpropagation in neural networks?",
        "options": [
          { "label": "A", "text": "Initialize network weights" },
          { "label": "B", "text": "Compute gradients via the chain rule" },
          { "label": "C", "text": "Apply activation functions" },
          { "label": "D", "text": "Normalize input data" }
        ],
        "orderIndex": 0
      }
    ]
  }
}
```

Note: `correctAnswer` and `explanation` are intentionally omitted from the quiz fetch. They are included in the attempt response.

---

### `GET /api/quiz/list`

List all quizzes for the authenticated user.

---

### `GET /api/quiz/:id`

Get a quiz with all questions (without answers).

---

### `POST /api/quiz/:id/attempt`

Submit a quiz attempt for scoring.

**Request Body:**
```json
{
  "answers": [
    { "questionId": "q-001-...", "selectedAnswer": "B" },
    { "questionId": "q-002-...", "selectedAnswer": "C" }
  ]
}
```

**Response (200):**
```json
{
  "data": {
    "score": 4,
    "total": 5,
    "percentage": 80,
    "results": [
      {
        "questionId": "q-001-...",
        "selectedAnswer": "B",
        "correctAnswer": "B",
        "isCorrect": true,
        "explanation": "Backpropagation computes gradients using the chain rule.",
        "sourcePage": 42
      },
      {
        "questionId": "q-002-...",
        "selectedAnswer": "A",
        "correctAnswer": "C",
        "isCorrect": false,
        "explanation": "CNNs use convolutional layers to detect spatial features.",
        "sourcePage": 55
      }
    ],
    "weakTopics": [
      { "topic": "Convolutional Neural Networks", "score": 0 },
      { "topic": "Activation Functions", "score": 50 }
    ],
    "completedAt": "2026-06-14T11:15:00Z"
  }
}
```

---

### `GET /api/quiz/attempts`

Get all quiz attempts with scores.

---

## Rooms

### `POST /api/rooms`

Create a study room.

**Request Body:**
```json
{
  "name": "ML Study Group",
  "description": "We're studying for the final exam together"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "room-001-...",
    "name": "ML Study Group",
    "inviteCode": "ml-study-2026",
    "memberCount": 1,
    "createdAt": "2026-06-14T12:00:00Z"
  }
}
```

---

### `POST /api/rooms/:id/join`

Join a room using its invite code.

**Request Body:**
```json
{
  "inviteCode": "ml-study-2026"
}
```

---

### `GET /api/rooms/:id/messages`

Get paginated message history for a room.

---

### `WebSocket: /api/rooms/:id/ws`

Connect via Socket.IO for real-time room chat.

**Connection:**
```typescript
const socket = io(`${API_URL}/rooms`, {
  auth: { token: clerkToken },
});

socket.emit('join:room', 'room-001-...');
socket.emit('room:message', {
  roomId: 'room-001-...',
  content: 'Anyone understand attention mechanisms?',
});

socket.on('room:message', (message) => {
  addMessageToChat(message);
});

socket.on('room:presence', ({ onlineUsers }) => {
  updateOnlineUsers(onlineUsers);
});
```

---

## Analytics

### `GET /api/analytics/stats`

Get study statistics for the authenticated user.

**Response (200):**
```json
{
  "data": {
    "totalDocuments": 5,
    "totalChats": 12,
    "totalQuizzes": 8,
    "totalQuizAttempts": 15,
    "averageScore": 72.5,
    "currentStreak": 3,
    "longestStreak": 7,
    "topWeakTopics": [
      { "topic": "Backpropagation", "score": 40 },
      { "topic": "Attention", "score": 55 }
    ],
    "activityByDay": [
      { "date": "2026-06-10", "chats": 3, "quizzes": 1 },
      { "date": "2026-06-12", "chats": 1, "quizzes": 2 }
    ]
  }
}
```

---

## Error Response Codes

| Status | Meaning | Common Causes |
|---|---|---|
| 400 | Bad Request | Invalid input, validation failure |
| 401 | Unauthorized | Missing/invalid Clerk token |
| 403 | Forbidden | Attempting to access another user's resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate creation, wrong state |
| 413 | Payload Too Large | File exceeds 50MB limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected error (check Sentry) |

All error responses follow this shape:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "fileName",
      "message": "File name must be between 1 and 255 characters"
    }
  ]
}
```

## Rate Limits

| Endpoint Group | Limit | Window |
|---|---|---|
| Health | 100 requests | 1 minute |
| Document CRUD | 30 requests | 1 minute |
| Chat messages | 20 requests | 1 minute |
| Quiz generation | 10 requests | 1 minute |
| Quiz attempts | 30 requests | 1 minute |
| Upload | 10 requests | 1 minute |
| Analytics | 60 requests | 1 minute |
| Room operations | 30 requests | 1 minute |

Rate limit headers are included in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
