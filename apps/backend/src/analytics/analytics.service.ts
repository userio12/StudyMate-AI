import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  constructor(private db: DatabaseService) {}

  async getStats(userId: string) {
    try {
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

      const recentActivity = await this.db.db!.execute<{ id: string; type: string; description: string; date: string }>(
        sql`
          SELECT id::text, 'document' AS type, title AS description, created_at AS date FROM documents WHERE user_id = ${userId}
          UNION ALL
          SELECT id::text, 'message' AS type, title AS description, created_at AS date FROM conversations WHERE user_id = ${userId}
          UNION ALL
          SELECT id::text, 'quiz' AS type, title AS description, created_at AS date FROM quizzes WHERE user_id = ${userId}
          UNION ALL
          SELECT id::text, 'room' AS type, name AS description, created_at AS date FROM rooms WHERE created_by = ${userId}
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
    } catch (error) {
      console.error('getStats error:', error);
      throw error;
    }
  }
}
