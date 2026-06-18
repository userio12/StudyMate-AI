import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, ParseUUIDPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateConversationSchema, SendMessageSchema, PaginationSchema, type Pagination } from '@studymate/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ChatService } from './chat.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  createConversation(
    @Body(new ZodValidationPipe(CreateConversationSchema)) body: { title: string; documentIds?: string[] },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.chatService.createConversation(body.title, user.userId, body.documentIds);
  }

  @Get('conversations')
  listConversations(
    @CurrentUser() user: CurrentUserPayload,
    @Query(new ZodValidationPipe(PaginationSchema)) query: Pagination,
  ) {
    return this.chatService.listConversations(user.userId, query.limit, query.offset);
  }

  @Get('conversations/:id')
  getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.chatService.getConversation(id, user.userId);
  }

  @Delete('conversations/:id')
  deleteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.chatService.deleteConversation(id, user.userId);
  }

  @Post('conversations/:id/message')
  async streamMessage(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body(new ZodValidationPipe(SendMessageSchema)) body: { content: string },
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const encoder = new TextEncoder();

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    try {
      await this.chatService.streamMessage(
        conversationId,
        body.content,
        user.userId,
        (token: string) => {
          res.write(encoder.encode(`data: ${token}\n\n`));
        },
        abortController.signal,
      );
      if (!abortController.signal.aborted) {
        res.write(encoder.encode('data: [DONE]\n\n'));
        res.end();
      }
    } catch (err) {
      if (abortController.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Stream failed';
      res.write(encoder.encode(`data: [ERROR] ${message}\n\n`));
      res.end();
    }
  }
}
