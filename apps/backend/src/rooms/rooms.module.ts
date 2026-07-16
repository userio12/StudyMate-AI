import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller.js';
import { RoomsService } from './rooms.service.js';
import { RoomsGateway } from './rooms.gateway.js';
import { DatabaseModule } from '../database/database.module.js';
import { CommonModule } from '../common/common.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [DatabaseModule, CommonModule, AuthModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
