import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { EmbeddingsService } from '../ai/embeddings.service.js';

const RRF_K = 60;
const VECTOR_LIMIT = 20;
const FTS_LIMIT = 20;
const FINAL_LIMIT = 10;

interface ChunkResult {
  id: string;
  documentId: string;
  content: string;
  heading: string | null;
  pageNumber: number | null;
}

@Injectable()
export class RagService {
  constructor(
    private db: DatabaseService,
    private embeddings: EmbeddingsService,
  ) {}

  async search(query: string, documentIds?: string[]): Promise<ChunkResult[]> {
    const queryVector = await this.embeddings.embed(query);
    const vectorLiteral = sql.raw(`'[${queryVector.join(',')}]'::vector`);

    const docFilter = documentIds?.length
      ? sql`AND document_id IN (${sql.join(documentIds.map((id) => sql`${id}`), sql`, `)})`
      : sql``;

    const vectorResults = await this.db.db!.execute<{
      id: string;
      document_id: string;
      content: string;
      heading: string | null;
      page_number: number | null;
      rank: number;
    }>(sql`
      SELECT id, document_id, content, heading, page_number,
        ROW_NUMBER() OVER (ORDER BY embedding <=> ${vectorLiteral}) AS rank
      FROM chunks
      WHERE embedding IS NOT NULL ${docFilter}
      ORDER BY embedding <=> ${vectorLiteral}
      LIMIT ${VECTOR_LIMIT}
    `);

    const ftsResults = await this.db.db!.execute<{
      id: string;
      document_id: string;
      content: string;
      heading: string | null;
      page_number: number | null;
      rank: number;
    }>(sql`
      SELECT id, document_id, content, heading, page_number,
        ROW_NUMBER() OVER (ORDER BY ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) DESC) AS rank
      FROM chunks
      WHERE to_tsvector('english', content) @@ plainto_tsquery('english', ${query}) ${docFilter}
      ORDER BY ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) DESC
      LIMIT ${FTS_LIMIT}
    `);

    const rrfScores = new Map<string, { chunk: ChunkResult; score: number }>();

    for (const r of vectorResults) {
      rrfScores.set(r.id, {
        chunk: { id: r.id, documentId: r.document_id, content: r.content, heading: r.heading, pageNumber: r.page_number },
        score: 1 / (RRF_K + Number(r.rank)),
      });
    }

    for (const r of ftsResults) {
      const existing = rrfScores.get(r.id);
      const rr = 1 / (RRF_K + Number(r.rank));
      if (existing) {
        existing.score += rr;
      } else {
        rrfScores.set(r.id, {
          chunk: { id: r.id, documentId: r.document_id, content: r.content, heading: r.heading, pageNumber: r.page_number },
          score: rr,
        });
      }
    }

    return [...rrfScores.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, FINAL_LIMIT)
      .map(([, v]) => v.chunk);
  }
}
