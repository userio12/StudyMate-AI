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

      // Productivity Stats
      const totalStudyTime = await this.db.db!.execute<{ total_minutes: number }>(
        sql`SELECT COALESCE(SUM(duration_minutes), 0)::int AS total_minutes FROM study_sessions WHERE user_id = ${userId}`,
      );

      const tasksCompleted = await this.db.db!.execute<{ count: number }>(
        sql`SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = ${userId} AND status = 'completed'`,
      );

      const subjectsProgress = await this.db.db!.execute<{ name: string; color: string; study_minutes: number }>(
        sql`
          WITH all_categories AS (
            SELECT id, name, COALESCE(color, '#3b82f6') as color FROM subjects WHERE user_id = ${userId}
            UNION ALL
            SELECT NULL::uuid AS id, 'Uncategorized' AS name, '#94a3b8' AS color
          )
          SELECT 
            c.name, 
            c.color, 
            COALESCE(SUM(ss.duration_minutes), 0)::int AS study_minutes
          FROM all_categories c
          LEFT JOIN study_sessions ss 
            ON (c.id = ss.subject_id OR (c.id IS NULL AND ss.subject_id IS NULL))
            AND ss.user_id = ${userId}
          WHERE c.id IS NOT NULL OR ss.id IS NOT NULL
          GROUP BY c.id, c.name, c.color
          ORDER BY study_minutes DESC
          LIMIT 5
        `,
      );

      const heatmapData = await this.db.db!.execute<{ date: string; duration: number }>(
        sql`
          SELECT DATE(completed_at)::text as date, SUM(duration_minutes)::int as duration
          FROM study_sessions
          WHERE user_id = ${userId} AND completed_at >= CURRENT_DATE - INTERVAL '60 days'
          GROUP BY DATE(completed_at)
          ORDER BY date ASC
        `,
      );

      return {
        documents: documentCount[0]?.count ?? 0,
        conversations: conversationCount[0]?.count ?? 0,
        quizzes: quizStats[0]?.count ?? 0,
        averageScore: quizStats[0]?.avg_score ?? null,
        recentActivity: recentActivity ?? [],
        
        // Productivity Suite
        totalStudyMinutes: totalStudyTime[0]?.total_minutes ?? 0,
        tasksCompleted: tasksCompleted[0]?.count ?? 0,
        subjectsProgress: subjectsProgress ?? [],
        heatmapData: heatmapData ?? [],
      };
    } catch (error) {
      console.error('getStats error:', error);
      throw error;
    }
  }
}
