import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmbeddingsService } from '../ai/embeddings.service.js';
import { AiService } from '../ai/ai.service.js';
import { chunks, documents } from '@studymate/db';
import { eq } from 'drizzle-orm';
import { MAX_CHUNK_LENGTH, CHUNK_OVERLAP } from '@studymate/shared';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

@Injectable()
export class PdfProcessorService {
  private readonly logger = new Logger(PdfProcessorService.name);

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private embeddings: EmbeddingsService,
    private ai: AiService,
  ) {}

  async processDocument(docId: string) {
    try {
      this.logger.log(`[PdfProcessorService] Starting processing for document ID: ${docId}`);
      
      await this.db.db!.update(documents).set({ status: 'processing' }).where(eq(documents.id, docId));
      this.logger.debug(`[PdfProcessorService] Document ${docId} status updated to 'processing'`);

      const doc = await this.db.db!.query.documents.findFirst({
        where: eq(documents.id, docId),
      });
      if (!doc) throw new Error(`[PdfProcessorService] Document not found in database: ${docId}`);

      this.logger.debug(`[PdfProcessorService] Fetching signed download URL for S3 Key: ${doc.s3Key}`);
      const downloadUrl = await this.storage.generateDownloadUrl(doc.s3Key);
      
      this.logger.log(`[PdfProcessorService] Extracting text from PDF (using pdf-parse)`);
      const text = await this.extractText(downloadUrl);
      
      this.logger.log(`[PdfProcessorService] Text extracted successfully. Extracted length: ${text.length} characters.`);
      
      if (text.length === 0) {
        this.logger.warn(`[PdfProcessorService] Warning: Extracted text length is 0! This might be an image-based PDF requiring OCR.`);
      }

      this.logger.log(`[PdfProcessorService] Creating semantic chunks...`);
      const textChunks = this.semanticChunk(text);

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
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from storage: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Try extracting text using pdf-parse first as it's much faster
      const data = await pdfParse(Buffer.from(buffer));
      let text = data.text.trim();
      
      // If pdf-parse failed to extract meaningful text, it's likely an image-based PDF
      // Fallback to OCR using NVIDIA's Llama 3.2 90B Vision Instruct
      if (text.length < 50) {
         this.logger.warn(`[PdfProcessorService] Extracted text is too short or empty. Falling back to OCR using LLaMA Vision via NVIDIA...`);
         text = await this.performOCR(Buffer.from(buffer));
      }
      
      return text;
    } catch (error) {
      this.logger.error('PDF Text Extraction Error:', error);
      throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async performOCR(buffer: Buffer): Promise<string> {
    try {
      this.logger.log(`[PdfProcessorService] Rendering PDF to images for OCR...`);
      const { createCanvas } = await import('@napi-rs/canvas');
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      
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

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        disableFontFace: true,
      });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      let fullText = '';

      // Process each page sequentially to avoid memory overload and API rate limits
      for (let i = 1; i <= numPages; i++) {
        this.logger.log(`[PdfProcessorService] OCR Processing Page ${i} of ${numPages}...`);
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvasFactory = new (NodeCanvasFactory as any)();
        const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

        await page.render({
          canvasContext: canvasAndContext.context,
          viewport: viewport,
          // @ts-ignore - canvasFactory is an internal property used for Node.js rendering
          canvasFactory: canvasFactory,
        }).promise;

        const base64Image = canvasAndContext.canvas.toDataURL('image/jpeg');
        
        // Call Nvidia Llama 3.2 90B Vision Instruct
        const pageText = await this.ai.executeWithFallback(async (client, providerName) => {
           // We explicitly want to use NVIDIA for OCR. If the fallback hits OpenRouter, we can try its 11B version.
           let visionModel = 'meta/llama-3.2-90b-vision-instruct'; // NVIDIA's default
           if (providerName === 'OpenRouter') {
             visionModel = 'meta-llama/llama-3.2-11b-vision-instruct'; 
           } else if (providerName === 'Gemini') {
             visionModel = 'gemini-2.5-flash';
           }
           
           this.logger.debug(`[PdfProcessorService] Requesting OCR from ${providerName} using model ${visionModel}`);
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
        }, 'OCR Extraction', 'NVIDIA');
        
        fullText += `\n\n[Page ${i}]\n${pageText}\n`;
      }
      
      this.logger.log(`[PdfProcessorService] OCR completed for all ${numPages} pages.`);
      return fullText.trim();
    } catch (error) {
      this.logger.error(`[PdfProcessorService] OCR failed:`, error);
      throw error;
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
