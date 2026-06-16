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
    if (texts.length === 1) return [await this.embed(texts[0]!)];

    const result = await this.ai.client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts.map((text) => ({ role: 'user' as const, parts: [{ text }] })),
    });

    return (result.embeddings ?? []).map((e) => e.values ?? []);
  }
}
