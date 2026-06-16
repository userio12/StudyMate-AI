import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module.js';
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

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
