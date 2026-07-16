import { Module } from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service.js';
import { StudySessionsController } from './study-sessions.controller.js';

import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [StudySessionsController],
  providers: [StudySessionsService],
})
export class StudySessionsModule {}
