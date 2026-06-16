import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddingsService } from './embeddings.service.js';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;
  let mockAi: { client: { models: { embedContent: ReturnType<typeof vi.fn> } } };

  beforeEach(() => {
    mockAi = {
      client: {
        models: {
          embedContent: vi.fn(),
        },
      },
    };
    service = new EmbeddingsService(mockAi as any);
  });

  describe('embed', () => {
    it('returns embedding vector from AI service', async () => {
      mockAi.client.models.embedContent.mockResolvedValue({
        embeddings: [{ values: [0.1, 0.2, 0.3] }],
      });

      const result = await service.embed('test text');

      expect(result).toEqual([0.1, 0.2, 0.3]);
      expect(mockAi.client.models.embedContent).toHaveBeenCalledWith({
        model: 'text-embedding-004',
        contents: [{ role: 'user', parts: [{ text: 'test text' }] }],
      });
    });

    it('throws when no embedding is returned', async () => {
      mockAi.client.models.embedContent.mockResolvedValue({ embeddings: [] });

      await expect(service.embed('test')).rejects.toThrow('No embedding returned');
    });

    it('throws when embeddings array is missing', async () => {
      mockAi.client.models.embedContent.mockResolvedValue({});

      await expect(service.embed('test')).rejects.toThrow('No embedding returned');
    });
  });

  describe('embedBatch', () => {
    it('embeds multiple texts in a single call', async () => {
      mockAi.client.models.embedContent.mockResolvedValue({
        embeddings: [{ values: [0.1] }, { values: [0.2] }, { values: [0.3] }],
      });

      const result = await service.embedBatch(['a', 'b', 'c']);

      expect(result).toHaveLength(3);
      expect(result).toEqual([[0.1], [0.2], [0.3]]);
      expect(mockAi.client.models.embedContent).toHaveBeenCalledTimes(1);
    });

    it('returns empty array for empty input', async () => {
      const result = await service.embedBatch([]);
      expect(result).toEqual([]);
    });

    it('delegates to embed for single text', async () => {
      mockAi.client.models.embedContent.mockResolvedValue({
        embeddings: [{ values: [0.5] }],
      });

      const result = await service.embedBatch(['a']);

      expect(result).toEqual([[0.5]]);
    });

    it('propagates errors from embed', async () => {
      mockAi.client.models.embedContent.mockRejectedValue(new Error('API error'));

      await expect(service.embedBatch(['a', 'b'])).rejects.toThrow('API error');
    });
  });
});
