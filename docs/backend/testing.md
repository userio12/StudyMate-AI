# Backend Testing

## Test Strategy

| Test Type | Tool | Scope | Speed | Run Frequency |
|---|---|---|---|---|
| **Unit** | Vitest | Individual services, pipes, guards, utils | ms | Every commit |
| **Integration** | Vitest + Testcontainers | Service + DB interactions | seconds | Every PR |
| **E2E** | Vitest + Supertest | Full HTTP flows (controller → service → DB) | seconds | Every PR |
| **Performance** | k6 | API benchmarks under load | minutes | Before release |

## Test Structure

```
test/
├── unit/
│   ├── services/
│   │   ├── documents.service.spec.ts
│   │   ├── chat.service.spec.ts
│   │   ├── quiz-generator.service.spec.ts
│   │   └── pdf-processor.service.spec.ts
│   ├── guards/
│   │   └── clerk-auth.guard.spec.ts
│   └── pipes/
│       └── validation.pipe.spec.ts
├── integration/
│   ├── documents.service.int-spec.ts
│   └── chat.service.int-spec.ts
└── e2e/
    ├── health.e2e-spec.ts
    ├── documents.e2e-spec.ts
    ├── chat.e2e-spec.ts
    └── quiz.e2e-spec.ts
```

## Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: 'test',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.module.ts',
        '**/*.dto.ts',
        '**/main.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

## Unit Tests

### Testing a Service

```typescript
// test/unit/services/documents.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockDb: MockDatabaseService;
  let mockStorage: MockStorageService;

  beforeEach(async () => {
    mockDb = createMockDatabaseService();
    mockStorage = createMockStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: StorageService, useValue: mockStorage },
        { provide: ConfigService, useValue: { awsS3Bucket: 'test-bucket' } },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  describe('findAll', () => {
    it('should return paginated documents for a user', async () => {
      mockDb.query.documents.findMany.mockResolvedValue([
        { id: '1', title: 'test.pdf', status: 'ready', pageCount: 10 },
      ]);
      mockDb.query.documents.count.mockResolvedValue(1);

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty array when user has no documents', async () => {
      mockDb.query.documents.findMany.mockResolvedValue([]);
      mockDb.query.documents.count.mockResolvedValue(0);

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });
});
```

### Testing the PDF Processor (Core Logic)

```typescript
// test/unit/services/pdf-processor.service.spec.ts
import { PdfProcessorService } from './pdf-processor.service';

describe('PdfProcessorService', () => {
  let processor: PdfProcessorService;

  beforeEach(() => {
    processor = new PdfProcessorService();
  });

  describe('semanticChunk', () => {
    it('should split by headings', () => {
      const pages = [
        { pageNumber: 1, text: 'Chapter 1: Introduction\nThis is the intro.\nBackground info here.' },
        { pageNumber: 2, text: 'Chapter 2: Methods\nFirst method.\nSecond method.\nChapter 3: Results\nThe results show...' },
      ];

      const chunks = processor.semanticChunk(pages);

      expect(chunks).toHaveLength(3);
      expect(chunks[0].heading).toBe('Chapter 1: Introduction');
      expect(chunks[1].heading).toBe('Chapter 2: Methods');
      expect(chunks[2].heading).toBe('Chapter 3: Results');
    });

    it('should handle empty pages', () => {
      const chunks = processor.semanticChunk([
        { pageNumber: 1, text: '' },
      ]);
      expect(chunks).toHaveLength(0);
    });

    it('should enforce 512 token limit', () => {
      const longText = 'word '.repeat(3000);
      const chunks = processor.semanticChunk([
        { pageNumber: 1, text: longText },
      ]);

      // Each chunk should be <= 512 tokens
      for (const chunk of chunks) {
        const tokens = chunk.content.length / 4;
        expect(tokens).toBeLessThanOrEqual(512);
      }
    });

    it('should create overlapping chunks', () => {
      const text = 'A\n'.repeat(3000);
      const chunks = processor.semanticChunk([
        { pageNumber: 1, text },
      ]);

      if (chunks.length > 1) {
        // Last ~50 chars of chunk N should appear in chunk N+1
        const overlap = chunks[0].content.slice(-50);
        expect(chunks[1].content).toContain(overlap);
      }
    });
  });
});
```

### Testing the Auth Guard

```typescript
// test/unit/guards/clerk-auth.guard.spec.ts
import { ClerkAuthGuard } from './clerk-auth.guard';

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;

  beforeEach(async () => {
    // ... module setup
  });

  it('should allow valid tokens', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer valid_token' },
    };
    const context = createMockExecutionContext(mockRequest);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.clerkId).toBe('clerk_123');
  });

  it('should reject missing tokens', async () => {
    const mockRequest = { headers: {} };

    await expect(
      guard.canActivate(createMockExecutionContext(mockRequest)),
    ).rejects.toThrow('Missing authentication token');
  });

  it('should reject invalid tokens', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer invalid_token' },
    };

    await expect(
      guard.canActivate(createMockExecutionContext(mockRequest)),
    ).rejects.toThrow('Invalid or expired token');
  });
});
```

## E2E Tests

```typescript
// test/e2e/health.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
      });
  });
});
```

```typescript
// test/e2e/documents.e2e-spec.ts
describe('Documents (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup app
    // Get auth token from Clerk test account
  });

  describe('POST /api/documents/upload-url', () => {
    it('should return a presigned URL for valid requests', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/documents/upload-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          fileSize: 1024 * 1024,
        })
        .expect(201);

      expect(res.body.data.presignedUrl).toMatch(/^https:\/\//);
      expect(res.body.data.documentId).toBeDefined();
      expect(res.body.data.s3Key).toMatch(/^uploads\//);
    });

    it('should reject files over 50MB', async () => {
      await request(app.getHttpServer())
        .post('/api/documents/upload-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileName: 'large.pdf',
          contentType: 'application/pdf',
          fileSize: 100 * 1024 * 1024,
        })
        .expect(400);
    });

    it('should reject non-PDF files', async () => {
      await request(app.getHttpServer())
        .post('/api/documents/upload-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileName: 'image.png',
          contentType: 'image/png',
          fileSize: 1024,
        })
        .expect(400);
    });
  });
});
```

## Mock Utilities

```typescript
// test/mocks/database.service.ts
export function createMockDatabaseService() {
  return {
    query: {
      users: { findFirst: jest.fn() },
      documents: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      conversations: { findMany: jest.fn() },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'mock-id' }]),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'mock-id' }]),
        }),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
    execute: jest.fn(),
  };
}

export function createMockExecutionContext(request: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({ status: jest.fn(), json: jest.fn() }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}
```

## Running Tests

```bash
# Unit tests
pnpm --filter backend test

# With coverage
pnpm --filter backend test:coverage

# E2E tests (requires running database)
pnpm --filter backend test:e2e

# Watch mode
pnpm --filter backend test:watch

# Single file
pnpm --filter backend test -- test/unit/services/pdf-processor.service.spec.ts
```

## Coverage Targets

| Area | Minimum Coverage |
|---|---|
| Services | 85% |
| Guards | 90% |
| Pipes | 95% |
| Controllers | 80% |
| AI services | 75% (integration-heavy) |
| Overall | 80% |

## CI Integration

Tests run automatically in GitHub Actions on every PR:

```yaml
# .github/workflows/ci.yml
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: pgvector/pgvector:pg16
      env:
        POSTGRES_DB: studymate_test
        POSTGRES_PASSWORD: postgres
      ports:
        - 5432:5432
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm --filter backend test -- --coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/studymate_test
    - uses: codecov/codecov-action@v4
```
