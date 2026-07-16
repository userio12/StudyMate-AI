import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { PdfProcessorService } from './pdf-processor.service.js';
import { DocumentProcessor } from './document.processor.js';
import { StorageModule } from '../storage/storage.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    StorageModule, 
    DatabaseModule, 
    AiModule
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, PdfProcessorService, DocumentProcessor],
  exports: [DocumentsService, PdfProcessorService],
})
export class DocumentsModule {}
