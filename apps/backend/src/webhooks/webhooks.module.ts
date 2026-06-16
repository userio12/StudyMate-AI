import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
