import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmbeddingsService } from '../ai/embeddings.service.js';
import { chunks, documents } from '@studymate/db';
import { eq } from 'drizzle-orm';
import { MAX_CHUNK_LENGTH, CHUNK_OVERLAP } from '@studymate/shared';

@Injectable()
export class PdfProcessorService {
  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private embeddings: EmbeddingsService,
  ) {}

  async processDocument(docId: string) {
    const doc = await this.db.db!.query.documents.findFirst({
      where: eq(documents.id, docId),
    });
    if (!doc) throw new Error('Document not found');

    const downloadUrl = await this.storage.generateDownloadUrl(doc.s3Key);
    const text = await this.extractText(downloadUrl);
    const textChunks = this.semanticChunk(text);

    const embeddingVectors = await this.embeddings.embedBatch(
      textChunks.map((c) => c.content),
    );

    await this.db.db!.transaction(async (tx) => {
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
        .set({ status: 'ready', pageCount: this.estimatedPages(text.length) })
        .where(eq(documents.id, docId));
    });
  }

  private async extractText(url: string): Promise<string> {
    try {
      const pdfjs = await import('pdfjs-dist');
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buffer }).promise;
      let fullText = '';

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as Array<{ str: string }>).map((item) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    } catch {
      throw new Error('Failed to extract text from PDF');
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
