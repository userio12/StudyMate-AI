import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { PdfProcessorService } from './pdf-processor.service.js';
import { documents } from '@studymate/db';
import { eq } from 'drizzle-orm';

interface DocumentProcessingJob {
  id: string;
  pdfProvider?: string;
}

@Processor('document-processing')
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private pdfProcessor: PdfProcessorService,
    private db: DatabaseService,
  ) {
    super();
  }

  async process(job: Job<DocumentProcessingJob, any, string>): Promise<any> {
    const { id, pdfProvider } = job.data;
    
    this.logger.log(`Processing document ${id} (job ${job.id})`);

    try {
      await this.db.db!
        .update(documents)
        .set({ status: 'processing' })
        .where(eq(documents.id, id));

      await this.pdfProcessor.processDocument(id, pdfProvider);
      
      this.logger.log(`Successfully processed document ${id}`);
    } catch (error) {
      this.logger.error(`Failed to process document ${id}`, error);
      
      await this.db.db!
        .update(documents)
        .set({ status: 'error' })
        .where(eq(documents.id, id));
        
      throw error;
    }
  }
}
