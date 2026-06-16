import { Body, Controller, Delete, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { CreateUploadUrlSchema, type CreateUploadUrlDto } from './dto/create-upload-url.dto.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

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
  processDocument(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.documentsService.processDocument(id, user.userId);
  }

  @Get()
  listDocuments(
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.documentsService.listDocuments(
      user.userId,
      Number(limit) || 20,
      Number(offset) || 0,
    );
  }

  @Get(':id')
  getDocument(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.documentsService.getDocument(id, user.userId);
  }

  @Delete(':id')
  deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.documentsService.deleteDocument(id, user.userId);
  }
}
