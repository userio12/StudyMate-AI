import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmbeddingsService } from '../ai/embeddings.service.js';
import { chunks, documents } from '@studymate/db';
import { eq } from 'drizzle-orm';
import { MAX_CHUNK_LENGTH, CHUNK_OVERLAP } from '@studymate/shared';

@Injectable()
export class PdfProcessorService {
  private readonly logger = new Logger(PdfProcessorService.name);

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private embeddings: EmbeddingsService,
  ) {}

  async processDocument(docId: string) {
    try {
      this.logger.log(`Starting processing for document: ${docId}`);
      
      await this.db.db!.update(documents).set({ status: 'processing' }).where(eq(documents.id, docId));

      const doc = await this.db.db!.query.documents.findFirst({
        where: eq(documents.id, docId),
      });
      if (!doc) throw new Error('Document not found');

      const downloadUrl = await this.storage.generateDownloadUrl(doc.s3Key);
      const text = await this.extractText(downloadUrl);
      
      this.logger.log(`Text extracted, length: ${text.length}. Creating chunks...`);
      const textChunks = this.semanticChunk(text);

      this.logger.log(`Generated ${textChunks.length} chunks. Generating embeddings...`);
      const embeddingVectors = await this.embeddings.embedBatch(
        textChunks.map((c) => c.content),
      );

      await this.db.db!.transaction(async (tx) => {
        // Clear existing chunks to allow re-processing
        await tx.delete(chunks).where(eq(chunks.documentId, docId));

        for (let i = 0; i < textChunks.length; i++) {
          const chunk = textChunks[i]!;
          await tx.insert(chunks).values({
            id: crypto.randomUUID(),
            documentId: docId,
            content: chunk.content,
            pageNumber: chunk.pageNumber,
            heading: chunk.heading,
            chunkIndex: i,
            tokenCount: chunk.content.split(/\s+/).length,
            embedding: embeddingVectors[i]!,
          });
        }

        await tx
          .update(documents)
          .set({ 
            status: 'ready', 
            pageCount: this.estimatedPages(text.length) 
          })
          .where(eq(documents.id, docId));
      });

      this.logger.log(`Document ${docId} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing document ${docId}:`, error);
      
      await this.db.db!.update(documents)
        .set({ status: 'error' })
        .where(eq(documents.id, docId));
        
      throw error;
    }
  }

  private async extractText(url: string): Promise<string> {
    try {
      const pdfjs = await import('pdfjs-dist');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from storage: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ 
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        disableFontFace: true, // Often better for Node.js environments
      });
      
      const doc = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as Array<any>)
          .map((item) => item.str)
          .join(' ');
        fullText += `[Page ${i}]\n${pageText}\n\n`;
      }

      return fullText.trim();
    } catch (error) {
      this.logger.error('PDF Text Extraction Error:', error);
      throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private semanticChunk(text: string): Array<{ content: string; pageNumber?: number; heading?: string }> {
    const lines = text.split('\n');
    const result: Array<{ content: string; pageNumber?: number; heading?: string }> = [];
    let currentChunk = '';
    let currentHeading: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const headingMatch = trimmed.match(/^(#{1,3}\s+)?(.+)$/);
      const isHeading = headingMatch && trimmed.length < 100 && !trimmed.endsWith('.');

      if (isHeading) {
        if (currentChunk) {
          result.push({ content: currentChunk.trim(), heading: currentHeading });
        }
        currentHeading = trimmed.replace(/^#{1,3}\s+/, '');
        currentChunk = '';
        continue;
      }

      if (currentChunk.length + trimmed.length > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
        result.push({ content: currentChunk.trim(), heading: currentHeading });
        const words = currentChunk.split(/\s+/);
        const overlap = words.slice(-Math.floor(CHUNK_OVERLAP / 5)).join(' ');
        currentChunk = overlap + '\n' + trimmed;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + trimmed;
      }
    }

    if (currentChunk) {
      result.push({ content: currentChunk.trim(), heading: currentHeading });
    }

    return result;
  }

  private estimatedPages(charCount: number): number {
    return Math.max(1, Math.ceil(charCount / 3000));
  }
}
