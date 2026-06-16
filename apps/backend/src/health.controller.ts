import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/guards/public.decorator.js';
import { DatabaseService } from './database/database.service.js';
import { StorageService } from './storage/storage.service.js';
import { AiService } from './ai/ai.service.js';

@Controller()
export class HealthController {
  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private ai: AiService,
  ) {}

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ready')
  async getReady() {
    const checks: Record<string, string> = {};

    try {
      await this.db.db!.execute('SELECT 1');
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    try {
      const key = `health-check-${Date.now()}`;
      await this.storage.generateUploadUrl(key, 'text/plain');
      checks.storage = 'ok';
    } catch {
      checks.storage = 'error';
    }

    checks.gemini = this.ai.client ? 'ok' : 'error';

    const allOk = Object.values(checks).every((s) => s === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
