# Backend Architecture (NestJS)

## Module Structure

Each feature module follows a consistent pattern:

```
┌──────────────────────────────────────────┐
│  Module (e.g., DocumentsModule)          │
│  ┌────────────────────────────────────┐  │
│  │ Controller (routes + validation)   │  │
│  ├────────────────────────────────────┤  │
│  │ Service (business logic)           │  │
│  ├────────────────────────────────────┤  │
│  │ DTOs (request/response types)      │  │
│  ├────────────────────────────────────┤  │
│  │ Interfaces (TypeScript contracts)  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Dependency Injection Pattern

```typescript
// Module definition
@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],   // For use by ChatModule, QuizModule
})
export class DocumentsModule {}

// Service with DI
@Injectable()
export class DocumentsService {
  constructor(
    private db: DatabaseService,     // Drizzle client
    private storage: StorageService,  // S3 operations
    private ai: AiService,            // Gemini + PDF processing
    private config: ConfigService,    // Typed environment
  ) {}
}

// Controller
@Controller('documents')
@UseGuards(ClerkAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.documentsService.findAll(user.id);
  }
}
```

## Guard Flow

```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (!token) throw new UnauthorizedException('Missing token');

    try {
      // Verify JWT with Clerk's SDK
      const payload = await verifyToken(token, {
        secretKey: this.config.clerkSecretKey,
      });

      // Find or create user in local DB
      const user = await this.syncUser(payload);
      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async syncUser(payload: ClerkTokenPayload): Promise<User> {
    // Upsert user by clerkId
    // Returns user with local UUID
  }
}
```

## Pipe Validation Flow

```typescript
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}

// Usage in controller:
@Post()
async create(
  @Body(new ZodValidationPipe(UploadUrlSchema))
  body: z.infer<typeof UploadUrlSchema>,
) { ... }
```

## Interceptor Chain

```
Request → LoggingInterceptor → TransformInterceptor → TimeoutInterceptor → Controller

LoggingInterceptor:
  - Logs method, URL, duration (via Pino)
  - Adds request ID header

TransformInterceptor:
  - Wraps all responses in { data, meta }
  - Paginated: { data: T[], meta: { total, page, limit, hasMore } }
  - Single: { data: T }

TimeoutInterceptor:
  - Race between actual handler and 30s timeout
  - Returns 504 Gateway Timeout if exceeded
```

## Error Handling

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly sentry?: SentryService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      // Known error — return as-is
      return response.status(exception.getStatus()).json(exception.getResponse());
    }

    // Unknown error — log, send to Sentry, return 500
    this.sentry?.captureException(exception);

    return response.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
}
```

## WebSocket Gateway (Study Rooms)

```typescript
@WebSocketGateway({
  namespace: '/rooms',
  cors: { origin: process.env.FRONTEND_URL },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track which users are in which rooms
  private roomUsers = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    // Verify Clerk token from handshake auth
    const user = await this.verifyToken(client.handshake.auth.token);
    client.data.user = user;
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(client: Socket, roomId: string) {
    const membership = await this.roomsService.verifyMembership(
      client.data.user.id,
      roomId,
    );
    if (!membership) {
      client.emit('error', 'Not a member of this room');
      return;
    }
    client.join(roomId);

    // Track user presence
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Set());
    }
    this.roomUsers.get(roomId)!.add(client.data.user.id);
    this.server.to(roomId).emit('room:presence', {
      onlineUsers: Array.from(this.roomUsers.get(roomId)!),
    });
  }

  @SubscribeMessage('room:message')
  async handleMessage(client: Socket, payload: { roomId: string; content: string }) {
    const message = await this.roomsService.saveMessage(
      client.data.user.id,
      payload.roomId,
      payload.content,
    );
    this.server.to(payload.roomId).emit('room:message', message);
  }
}
```

## Configuration Service

```typescript
// config/env.ts — Typed environment with Zod validation
export const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  SENTRY_DSN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

// ConfigService reads and caches validated env
@Injectable()
export class ConfigService {
  private env: Env;

  constructor() {
    this.env = envSchema.parse(process.env);
  }

  get port(): number { return this.env.PORT; }
  get databaseUrl(): string { return this.env.DATABASE_URL; }
  get clerkSecretKey(): string { return this.env.CLERK_SECRET_KEY; }
  // ... etc
}
```
