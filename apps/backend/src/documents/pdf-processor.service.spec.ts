import { describe, it, expect, beforeEach } from 'vitest';
import { PdfProcessorService } from './pdf-processor.service.js';

import { DatabaseService } from './../database/database.service.js';
import { StorageService } from './../storage/storage.service.js';
import { EmbeddingsService } from './../ai/embeddings.service.js';
import { AiService } from './../ai/ai.service.js';

class MockDb {
  query = { documents: { findFirst: () => Promise.resolve(null) } };
  insert = () => ({ values: () => Promise.resolve() });
  update = () => ({ set: () => ({ where: () => Promise.resolve() }) });
}

class MockStorage {
  generateDownloadUrl = () => Promise.resolve('https://example.com/test.pdf');
}

class MockEmbeddings {
  embedBatch = (texts: string[]) => Promise.resolve(texts.map(() => Array(768).fill(0.1)));
}

class MockAiService {
  executeWithFallback = (fn: any) => Promise.resolve(fn({}, 'Mock'));
}

describe('PdfProcessorService', () => {
  let service: PdfProcessorService;

  beforeEach(() => {
    const db = new MockDb() as unknown as DatabaseService;
    const storage = new MockStorage() as unknown as StorageService;
    const embeddings = new MockEmbeddings() as unknown as EmbeddingsService;
    const ai = new MockAiService() as unknown as AiService;
    service = new PdfProcessorService(db, storage, embeddings, ai);
  });

  describe('semanticChunk', () => {
    it('splits text by headings', () => {
      const text = '# Introduction\nThis is the intro.\n## Methods\nThis is the methods section.';
      const chunks = (service as any).semanticChunk(text);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toMatchObject({
        content: expect.stringContaining('This is the intro'),
        heading: 'Introduction',
      });
      expect(chunks[1]).toMatchObject({
        content: expect.stringContaining('This is the methods section'),
        heading: 'Methods',
      });
    });

    it('returns a single chunk for plain text', () => {
      const text = 'Just a single paragraph of text. With multiple sentences.';
      const chunks = (service as any).semanticChunk(text);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe(text);
      expect(chunks[0].heading).toBeUndefined();
    });

    it('respects MAX_CHUNK_LENGTH boundaries across multiple lines', () => {
      const lines = Array.from({ length: 10 }, () => 'word '.repeat(200)).join('\n');
      const chunks = (service as any).semanticChunk(lines);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((c: { content: string }) => {
        expect(c.content.length).toBeLessThanOrEqual(1200);
      });
    });

    it('handles empty text', () => {
      const chunks = (service as any).semanticChunk('');

      expect(chunks).toHaveLength(0);
    });

    it('handles text with only whitespace', () => {
      const chunks = (service as any).semanticChunk('   \n  \n  ');

      expect(chunks).toHaveLength(0);
    });

    it('skips lines that are just whitespace', () => {
      const text = 'First paragraph.\n  \nSecond paragraph.';
      const chunks = (service as any).semanticChunk(text);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toContain('First paragraph.');
      expect(chunks[0].content).toContain('Second paragraph.');
    });
  });

  describe('estimatedPages', () => {
    it('returns 1 for fewer than 3000 characters', () => {
      expect((service as any).estimatedPages(100)).toBe(1);
    });

    it('returns correct page count for large text', () => {
      expect((service as any).estimatedPages(6000)).toBe(2);
      expect((service as any).estimatedPages(9000)).toBe(3);
    });

    it('rounds up partial pages', () => {
      expect((service as any).estimatedPages(3500)).toBe(2);
    });
  });
});
