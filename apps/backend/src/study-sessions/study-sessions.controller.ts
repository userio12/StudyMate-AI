import { Controller, Get, Post, Body } from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@Controller('study-sessions')
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: CurrentUserPayload) {
    return this.studySessionsService.create(user.userId, body);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.studySessionsService.findAll(user.userId);
  }
}
