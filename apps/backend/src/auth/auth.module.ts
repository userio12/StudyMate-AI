import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './guards/clerk-auth.guard.js';
import { DatabaseModule } from '../database/database.module.js';
import { ClerkAuthService } from './clerk-auth.service.js';
import { CommonModule } from '../common/common.module.js';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [
    ClerkAuthService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
  exports: [ClerkAuthService],
})
export class AuthModule {}
