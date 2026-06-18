import { Body, Controller, Delete, Get, Param, Post, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { CreateUploadUrlSchema, type CreateUploadUrlDto } from './dto/create-upload-url.dto.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { PaginationSchema, type Pagination } from '@studymate/shared';

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('upload-url')
  createUploadUrl(
    @Body(new ZodValidationPipe(CreateUploadUrlSchema)) body: CreateUploadUrlDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.documentsService.createUploadUrl(body, user.userId);
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.ACCEPTED)
  async processDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Start processing in the background to avoid timeouts
    this.documentsService.processDocument(id, user.userId).catch((err) => {
      console.error(`Background processing failed for document ${id}:`, err);
    });

    return { status: 'processing', message: 'Document processing started in background' };
  }

  @Get()
  listDocuments(
    @CurrentUser() user: CurrentUserPayload,
    @Query(new ZodValidationPipe(PaginationSchema)) query: Pagination,
  ) {
    return this.documentsService.listDocuments(
      user.userId,
      query.limit,
      query.offset,
    );
  }

  @Get(':id')
  getDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.documentsService.getDocument(id, user.userId);
  }

  @Delete(':id')
  deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.documentsService.deleteDocument(id, user.userId);
  }
}
