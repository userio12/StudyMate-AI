import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmbeddingsService } from '../ai/embeddings.service.js';
import { AiService } from '../ai/ai.service.js';
import { chunks, documents } from '@studymate/db';
import { eq } from 'drizzle-orm';
import { MAX_CHUNK_LENGTH, CHUNK_OVERLAP } from '@studymate/shared';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { convert } from '@opendataloader/pdf';@Injectable()
export class PdfProcessorService {
  private readonly logger = new Logger(PdfProcessorService.name);

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private embeddings: EmbeddingsService,
    private ai: AiService,
  ) {}

  private async updateProgress(docId: string, progress: number) {
    await this.db.db!.update(documents).set({ progress }).where(eq(documents.id, docId));
  }

  async processDocument(docId: string, pdfProvider?: string) {
    try {
      this.logger.log(`[PdfProcessorService] Starting processing for document ID: ${docId}`);
      
      await this.db.db!.update(documents).set({ status: 'processing', progress: 0 }).where(eq(documents.id, docId));
      this.logger.debug(`[PdfProcessorService] Document ${docId} status updated to 'processing'`);

      const doc = await this.db.db!.query.documents.findFirst({
        where: eq(documents.id, docId),
      });
      if (!doc) throw new Error(`[PdfProcessorService] Document not found in database: ${docId}`);

      this.logger.debug(`[PdfProcessorService] Fetching signed download URL for S3 Key: ${doc.s3Key}`);
      const downloadUrl = await this.storage.generateDownloadUrl(doc.s3Key);
      
      await this.updateProgress(docId, 5);
      
      this.logger.log(`[PdfProcessorService] Extracting text from PDF (using pdf-parse)`);
      const text = await this.extractText(downloadUrl, pdfProvider, docId);
      
      this.logger.log(`[PdfProcessorService] Text extracted successfully. Extracted length: ${text.length} characters.`);
      
      await this.updateProgress(docId, 85);
      
      if (text.length === 0) {
        this.logger.warn(`[PdfProcessorService] Warning: Extracted text length is 0! This might be an image-based PDF requiring OCR.`);
      }

      this.logger.log(`[PdfProcessorService] Creating semantic chunks...`);
      const textChunks = this.semanticChunk(text);

      await this.updateProgress(docId, 95);
      this.logger.log(`[PdfProcessorService] Generated ${textChunks.length} chunks. Fetching embeddings...`);
      const embeddingVectors = await this.embeddings.embedBatch(
        textChunks.map((c) => c.content),
      );
      this.logger.debug(`[PdfProcessorService] Embeddings generated successfully for ${embeddingVectors.length} chunks.`);

      this.logger.log(`[PdfProcessorService] Starting database transaction to insert chunks...`);
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
            progress: 100,
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

  private async extractText(url: string, pdfProvider?: string, docId?: string): Promise<string> {
    const tempDir = path.join(os.tmpdir(), `pdf-process-${Date.now()}`);
    const tempFilePath = path.join(tempDir, 'document.pdf');
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      
      const buffer = await response.arrayBuffer();
      const nodeBuffer = Buffer.from(buffer);
      await fs.writeFile(tempFilePath, nodeBuffer);
      
      this.logger.log(`[PdfProcessorService] Extracting text using @opendataloader/pdf...`);
      const { convert } = await import('@opendataloader/pdf');
      const markdown = await convert(tempFilePath, { format: 'markdown', quiet: true });
      let text = markdown.trim();

      if (docId) await this.updateProgress(docId, 15);

      // Dynamic Page Detection
      this.logger.log(`[PdfProcessorService] Analyzing pages to detect scanned images...`);
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        disableFontFace: true,
      });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      const imagePages: number[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const rawText = textContent.items.map((item: any) => item.str).join(' ').trim();
        if (rawText.length < 50) {
          imagePages.push(i);
        }
      }

      if (imagePages.length > 0) {
        this.logger.log(`[PdfProcessorService] Found ${imagePages.length} image pages requiring OCR. Processing...`);
        const { createCanvas } = await import('@napi-rs/canvas');
        function NodeCanvasFactory() {}
        NodeCanvasFactory.prototype = {
          create: function (width: number, height: number) {
            const canvas = createCanvas(width, height);
            const context = canvas.getContext('2d');
            return { canvas, context };
          },
          reset: function (canvasAndContext: any, width: number, height: number) {
            canvasAndContext.canvas.width = width;
            canvasAndContext.canvas.height = height;
          },
          destroy: function (canvasAndContext: any) {
            canvasAndContext.canvas.width = 0;
            canvasAndContext.canvas.height = 0;
            canvasAndContext.canvas = null;
            canvasAndContext.context = null;
          },
        };

        const concurrencyLimit = 5; 
        const pageResults: { index: number, text: string }[] = [];

        for (let i = 0; i < imagePages.length; i += concurrencyLimit) {
          const batch = imagePages.slice(i, i + concurrencyLimit);
          const batchPromises = batch.map(async (pageNum) => {
            this.logger.log(`[PdfProcessorService] OCR Processing Page ${pageNum}...`);
            const page = await pdfDocument.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.25 });
            const canvasFactory = new (NodeCanvasFactory as any)();
            const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

            await page.render({
              canvasContext: canvasAndContext.context,
              viewport: viewport,
              // @ts-expect-error
              canvasFactory: canvasFactory,
            }).promise;

            const base64Image = canvasAndContext.canvas.toDataURL('image/jpeg');
            const pageText = await this.ai.executeWithFallback(async (client, providerName) => {
               let visionModel = 'meta/llama-3.2-90b-vision-instruct'; 
               if (providerName === 'OpenRouter') visionModel = 'meta-llama/llama-3.2-11b-vision-instruct'; 
               else if (providerName === 'Gemini') visionModel = 'gemini-2.5-flash';
               
               const response = await client.chat.completions.create({
                 model: visionModel,
                 messages: [
                   {
                     role: 'user',
                     content: [
                       { type: 'text', text: 'Extract all the text from this image exactly as it appears. Do not summarize or add conversational filler. If there is no text, return an empty string.' },
                       { type: 'image_url', image_url: { url: base64Image } }
                     ]
                   }
                 ]
               });
               return response.choices[0]?.message?.content || '';
            }, 'OCR Extraction', (pdfProvider as 'OpenRouter' | 'Gemini' | 'NVIDIA' | undefined) || 'Gemini');
            
            return { index: pageNum, text: pageText };
          });

          const results = await Promise.all(batchPromises);
          pageResults.push(...results);
          
          if (docId) {
            const pct = 15 + Math.floor(((i + batch.length) / imagePages.length) * 65);
            await this.updateProgress(docId, pct);
          }
        }
        
        pageResults.sort((a, b) => a.index - b.index);
        const ocrText = pageResults.map(r => `\n\n[Scanned Page ${r.index}]\n${r.text}\n`).join('');
        text += '\n\n' + ocrText;
      }
      
      return text;
    } catch (error) {
      this.logger.error('PDF Text Extraction Error:', error);
      throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
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
