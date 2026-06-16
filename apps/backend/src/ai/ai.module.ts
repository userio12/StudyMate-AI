import { Module } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { EmbeddingsService } from './embeddings.service.js';
import { ChatLlmService } from './chat-llm.service.js';

@Module({
  providers: [AiService, EmbeddingsService, ChatLlmService],
  exports: [AiService, EmbeddingsService, ChatLlmService],
})
export class AiModule {}
