import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  constructor(private db: DatabaseService) {}

  async getStats(userId: string) {
    const documentCount = await this.db.db!.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM documents WHERE user_id = ${userId}`,
    );

    const conversationCount = await this.db.db!.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM conversations WHERE user_id = ${userId}`,
    );

    const quizStats = await this.db.db!.execute<{ count: number; avg_score: number | null }>(
      sql`
        SELECT 
          COUNT(*)::int AS count,
          AVG(score)::float AS avg_score
        FROM quiz_attempts 
        WHERE user_id = ${userId} AND score IS NOT NULL
      `,
    );

    const recentActivity = await this.db.db!.execute<{ date: string; count: number }>(
      sql`
        SELECT DATE(c.created_at)::text AS date, COUNT(*)::int AS count
        FROM conversations c
        WHERE c.user_id = ${userId}
        GROUP BY DATE(c.created_at)
        ORDER BY date DESC
        LIMIT 7
      `,
    );

    return {
      documents: documentCount[0]?.count ?? 0,
      conversations: conversationCount[0]?.count ?? 0,
      quizzes: quizStats[0]?.count ?? 0,
      averageScore: quizStats[0]?.avg_score ?? null,
      recentActivity: recentActivity ?? [],
    };
  }
}
