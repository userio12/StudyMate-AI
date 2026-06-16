import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GenerateQuizSchema, SubmitAttemptSchema } from '@studymate/shared';
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.quizService.listQuizzes(user.userId, Number(limit) || 20, Number(offset) || 0);
  }

  @Get(':id')
  getQuiz(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizService.getQuiz(id, user.userId);
  }

  @Post(':id/attempt')
  startAttempt(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizService.startAttempt(id, user.userId);
  }

  @Post(':id/attempt/:attemptId/submit')
  submitAttempt(
    @Param('id') id: string,
    @Param('attemptId') attemptId: string,
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
