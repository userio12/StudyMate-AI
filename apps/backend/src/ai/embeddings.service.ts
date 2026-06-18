import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from '@studymate/shared';

@Injectable()
export class EmbeddingsService {
  constructor(private ai: AiService) {}

  async embed(text: string): Promise<number[]> {
    const result = await this.ai.client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
    });

    const values = result.embeddings?.[0]?.values;
    if (!values) throw new Error('No embedding returned');

    return values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    
    const BATCH_SIZE = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const result = await this.ai.client.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch.map((text) => ({ role: 'user' as const, parts: [{ text }] })),
      });

      const batchEmbeddings = (result.embeddings ?? []).map((e) => e.values ?? []);
      results.push(...batchEmbeddings);
    }

    return results;
  }
}
