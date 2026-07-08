import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from '@studymate/shared';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(private ai: AiService) {}

  async embed(text: string): Promise<number[]> {
    if (!this.ai.geminiClient) {
      throw new Error('GEMINI_API_KEY is missing. Embeddings require Google Gemini.');
    }

    const result = await this.ai.geminiClient.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const values = result.data[0]?.embedding;
    if (!values) throw new Error('No embedding returned');

    return values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    if (!this.ai.geminiClient) {
      throw new Error('GEMINI_API_KEY is missing. Embeddings require Google Gemini.');
    }

    const BATCH_SIZE = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const response = await this.ai.geminiClient.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIMENSIONS,
      });
      
      const batchEmbeddings = response.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
        
      results.push(...batchEmbeddings);
    }

    return results;
  }
}
