import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from './config/config.module.js';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AiModule } from './ai/ai.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { ChatModule } from './chat/chat.module.js';
import { QuizModule } from './quiz/quiz.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { HealthController } from './health.controller.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { StudySessionsModule } from './study-sessions/study-sessions.module.js';
import { GoalsModule } from './goals/goals.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.get('REDIS_URL') as string);
        return {
          connection: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port, 10),
            username: redisUrl.username || 'default',
            password: redisUrl.password,
            tls: { rejectUnauthorized: false },
            family: 0,
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CommonModule,
    StorageModule,
    AiModule,
    DocumentsModule,
    ChatModule,
    QuizModule,
    RoomsModule,
    AnalyticsModule,
    WebhooksModule,
    SubjectsModule,
    TasksModule,
    StudySessionsModule,
    GoalsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
