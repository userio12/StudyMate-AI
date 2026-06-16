import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('stats')
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getStats(user.userId);
  }
}
