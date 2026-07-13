import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { tasks } from '@studymate/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(userId: string, body: any) {
    const [task] = await this.dbService.db!.insert(tasks).values({
      userId,
      title: body.title,
      subjectId: body.subjectId || null,
      description: body.description || null,
      status: body.status || 'pending',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    }).returning();
    return task;
  }

  async findAll(userId: string) {
    return this.dbService.db!.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      with: {
        subject: true,
      },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });
  }

  async update(id: string, userId: string, body: any) {
    const updateData: any = { updatedAt: new Date() };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subjectId !== undefined) updateData.subjectId = body.subjectId;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    const [task] = await this.dbService.db!.update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(id: string, userId: string) {
    const [deleted] = await this.dbService.db!.delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
      
    if (!deleted) throw new NotFoundException('Task not found');
    return { success: true };
  }
}
