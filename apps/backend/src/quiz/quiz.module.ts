import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller.js';
import { QuizService } from './quiz.service.js';
import { QuizGeneratorService } from './quiz-generator.service.js';
import { QuizScorerService } from './quiz-scorer.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [QuizController],
  providers: [QuizService, QuizGeneratorService, QuizScorerService],
})
export class QuizModule {}
