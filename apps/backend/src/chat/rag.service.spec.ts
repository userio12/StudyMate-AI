import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RagService } from './rag.service.js';

describe('RagService', () => {
  let service: RagService;
  let mockDb: { db: { execute: ReturnType<typeof vi.fn> } };
  let mockEmbeddings: { embed: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDb = {
      db: {
        execute: vi.fn(),
      },
    };

    mockEmbeddings = {
      embed: vi.fn(),
    };

    service = new RagService(mockDb as any, mockEmbeddings as any);
  });

  describe('search', () => {
    it('returns empty results when no matches found', async () => {
      mockEmbeddings.embed.mockResolvedValue(Array(768).fill(0.1));
      mockDb.db.execute
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const results = await service.search('test query');

      expect(results).toEqual([]);
    });

    it('passes the query to the embedding service', async () => {
      mockEmbeddings.embed.mockResolvedValue(Array(768).fill(0.1));
      mockDb.db.execute
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.search('custom query');

      expect(mockEmbeddings.embed).toHaveBeenCalledWith('custom query');
    });

    it('includes documentIds filter when provided', async () => {
      mockEmbeddings.embed.mockResolvedValue(Array(768).fill(0.1));
      mockDb.db.execute
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.search('query', ['doc-1', 'doc-2']);

      expect(mockDb.db.execute).toHaveBeenCalledTimes(2);
    });

    it('returns results from hybrid search', async () => {
      mockEmbeddings.embed.mockResolvedValue(Array(768).fill(0.1));

      const vectorResults = [
        { id: '1', document_id: 'doc-1', content: 'Result A', heading: null, page_number: null, rank: '1' },
        { id: '2', document_id: 'doc-1', content: 'Result B', heading: 'Heading', page_number: 1, rank: '2' },
      ];

      const ftsResults = [
        { id: '1', document_id: 'doc-1', content: 'Result A', heading: null, page_number: null, rank: '1' },
        { id: '3', document_id: 'doc-2', content: 'Result C', heading: null, page_number: null, rank: '2' },
      ];

      mockDb.db.execute
        .mockResolvedValueOnce(vectorResults)
        .mockResolvedValueOnce(ftsResults);

      const results = await service.search('test');

      expect(results).toHaveLength(3);

      const ids = results.map((r) => r.id);
      expect(ids).toContain('1');
      expect(ids).toContain('2');
      expect(ids).toContain('3');
    });

    it('sorts by RRF score descending', async () => {
      mockEmbeddings.embed.mockResolvedValue(Array(768).fill(0.1));

      const vectorResults = [
        { id: '1', document_id: 'doc-1', content: 'Low rank', heading: null, page_number: null, rank: '20' },
      ];

      const ftsResults = [
        { id: '2', document_id: 'doc-1', content: 'High rank', heading: null, page_number: null, rank: '1' },
      ];

      mockDb.db.execute
        .mockResolvedValueOnce(vectorResults)
        .mockResolvedValueOnce(ftsResults);

      const results = await service.search('test');

      expect(results).toHaveLength(2);
      expect(results[0]?.id).toBe('2');
    });
  });
});
