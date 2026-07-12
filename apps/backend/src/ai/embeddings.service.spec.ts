import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddingsService } from './embeddings.service.js';

import { AiService } from './ai.service.js';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;
  let mockAi: { geminiClient: { embeddings: { create: ReturnType<typeof vi.fn> } } };

  beforeEach(() => {
    mockAi = {
      geminiClient: {
        embeddings: {
          create: vi.fn(),
        },
      },
    };
    service = new EmbeddingsService(mockAi as unknown as AiService);
  });

  describe('embed', () => {
    it('returns embedding vector from AI service', async () => {
      mockAi.geminiClient.embeddings.create.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      const result = await service.embed('test text');

      expect(result).toEqual([0.1, 0.2, 0.3]);
      expect(mockAi.geminiClient.embeddings.create).toHaveBeenCalledWith({
        model: 'gemini-embedding-2',
        input: 'test text',
        dimensions: 768,
      });
    });

    it('throws when no embedding is returned', async () => {
      mockAi.geminiClient.embeddings.create.mockResolvedValue({ data: [] });

      await expect(service.embed('test')).rejects.toThrow('No embedding returned');
    });

    it('throws when embeddings array is missing', async () => {
      mockAi.geminiClient.embeddings.create.mockResolvedValue({});

      await expect(service.embed('test')).rejects.toThrow('No embedding returned');
    });
  });

  describe('embedBatch', () => {
    it('embeds multiple texts in a single call', async () => {
      mockAi.geminiClient.embeddings.create.mockResolvedValue({
        data: [
          { index: 0, embedding: [0.1] },
          { index: 1, embedding: [0.2] },
          { index: 2, embedding: [0.3] },
        ],
      });

      const result = await service.embedBatch(['a', 'b', 'c']);

      expect(result).toHaveLength(3);
      expect(result).toEqual([[0.1], [0.2], [0.3]]);
      expect(mockAi.geminiClient.embeddings.create).toHaveBeenCalledTimes(1);
    });

    it('returns empty array for empty input', async () => {
      const result = await service.embedBatch([]);
      expect(result).toEqual([]);
    });

    it('delegates to embed for single text', async () => {
      mockAi.geminiClient.embeddings.create.mockResolvedValue({
        data: [{ index: 0, embedding: [0.5] }],
      });

      const result = await service.embedBatch(['a']);

      expect(result).toEqual([[0.5]]);
    });

    it('propagates errors from embed', async () => {
      mockAi.geminiClient.embeddings.create.mockRejectedValue(new Error('API error'));

      await expect(service.embedBatch(['a', 'b'])).rejects.toThrow('API error');
    });
  });
});
