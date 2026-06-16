import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { PdfProcessorService } from './pdf-processor.service.js';
import { StorageModule } from '../storage/storage.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [StorageModule, DatabaseModule, AiModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PdfProcessorService],
  exports: [DocumentsService, PdfProcessorService],
})
export class DocumentsModule {}
