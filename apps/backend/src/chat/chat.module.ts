import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { RagService } from './rag.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [ChatController],
  providers: [ChatService, RagService],
})
export class ChatModule {}
