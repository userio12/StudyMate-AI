import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const url = 'postgresql://postgres.qxvcgajxegqiupnknlbk:%40studymate-ai@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const client = postgres(url, { ssl: 'require' });
const db = drizzle(client);

async function test() {
  const userId = 'test';
  try {
    const documentCount = await db.execute(sql`SELECT COUNT(*)::int AS count FROM documents WHERE user_id = ${userId}`);
    console.log('documentCount:', documentCount);
    const conversationCount = await db.execute(sql`SELECT COUNT(*)::int AS count FROM conversations WHERE user_id = ${userId}`);
    console.log('conversationCount:', conversationCount);
    const quizStats = await db.execute(sql`SELECT COUNT(*)::int AS count, AVG(score)::float AS avg_score FROM quiz_attempts WHERE user_id = ${userId} AND score IS NOT NULL`);
    console.log('quizStats:', quizStats);
    const recentActivity = await db.execute(
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
      `
    );
    console.log('recentActivity:', recentActivity);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

test();
