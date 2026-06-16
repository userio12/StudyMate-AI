import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PdfProcessorService } from './pdf-processor.service.js';
import { documents } from '@studymate/db';
import { eq } from 'drizzle-orm';
import type { CreateUploadUrlDto } from './dto/create-upload-url.dto.js';

@Injectable()
export class DocumentsService {
  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private pdfProcessor: PdfProcessorService,
  ) {}

  async createUploadUrl(body: CreateUploadUrlDto, userId: string) {
    const id = crypto.randomUUID();
    const s3Key = `uploads/${userId}/${id}.pdf`;

    const uploadUrl = await this.storage.generateUploadUrl(s3Key, body.mimeType);

    await this.db.db!.insert(documents).values({
      id,
      userId,
      title: body.fileName.replace(/\.pdf$/i, ''),
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      s3Key,
      status: 'pending',
    });

    return { id, uploadUrl, s3Key };
  }

  async processDocument(id: string, userId: string) {
    const doc = await this.db.db!.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException();

    await this.db.db!
      .update(documents)
      .set({ status: 'processing' })
      .where(eq(documents.id, id));

    try {
      await this.pdfProcessor.processDocument(id);
    } catch {
      await this.db.db!
        .update(documents)
        .set({ status: 'error' })
        .where(eq(documents.id, id));
      throw new Error('Failed to process document');
    }

    return { id, status: 'ready' };
  }

  async listDocuments(userId: string, limit = 20, offset = 0) {
    return this.db.db!.query.documents.findMany({
      where: eq(documents.userId, userId),
      orderBy: (docs, { desc }) => [desc(docs.createdAt)],
      limit,
      offset,
    });
  }

  async getDocument(id: string, userId: string) {
    const doc = await this.db.db!.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException();

    return doc;
  }

  async deleteDocument(id: string, userId: string) {
    const doc = await this.db.db!.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException();

    await this.db.db!.delete(documents).where(eq(documents.id, id));
    await this.storage.deleteObject(doc.s3Key);

    return { deleted: true };
  }
}
