import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { studySessions, tasks } from '@studymate/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class StudySessionsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(userId: string, body: any) {
    let subjectId = body.subjectId || null;
    
    // Auto-link to the task's subject if not explicitly provided
    if (!subjectId && body.taskId) {
      const task = await this.dbService.db!.query.tasks.findFirst({
        where: eq(tasks.id, body.taskId)
      });
      if (task) {
        subjectId = task.subjectId;
      }
    }

    const [session] = await this.dbService.db!.insert(studySessions).values({
      userId,
      subjectId,
      taskId: body.taskId || null,
      durationMinutes: body.durationMinutes,
      type: body.type || 'pomodoro',
    }).returning();
    return session;
  }

  async findAll(userId: string) {
    return this.dbService.db!.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
      orderBy: (sessions, { desc }) => [desc(sessions.completedAt)],
    });
  }
}
