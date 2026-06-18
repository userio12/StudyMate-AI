import { Body, Controller, Get, Param, Post, Query, ParseUUIDPipe } from '@nestjs/common';
import { GenerateQuizSchema, SubmitAttemptSchema, PaginationSchema, type Pagination } from '@studymate/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { QuizService } from './quiz.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('generate')
  generateQuiz(
    @Body(new ZodValidationPipe(GenerateQuizSchema)) body: { documentIds: string[]; difficulty: string; questionCount?: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizService.generateQuiz(body.documentIds, body.difficulty, user.userId, body.questionCount);
  }

  @Get('list')
  listQuizzes(
    @CurrentUser() user: CurrentUserPayload,
    @Query(new ZodValidationPipe(PaginationSchema)) query: Pagination,
  ) {
    return this.quizService.listQuizzes(user.userId, query.limit, query.offset);
  }

  @Get(':id')
  getQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizService.getQuiz(id, user.userId);
  }

  @Post(':id/attempt')
  startAttempt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizService.startAttempt(id, user.userId);
  }

  @Post(':id/attempt/:attemptId/submit')
  submitAttempt(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body(new ZodValidationPipe(SubmitAttemptSchema)) body: { answers: Record<string, string> },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizService.submitAttempt(id, attemptId, body.answers, user.userId);
  }

  @Get('attempts')
  listAttempts(@CurrentUser() user: CurrentUserPayload) {
    return this.quizService.listAttempts(user.userId);
  }
}
