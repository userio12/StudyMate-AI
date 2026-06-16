import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@studymate/db';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client: postgres.Sql | null = null;
  public db: PostgresJsDatabase<typeof schema> | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('DATABASE_URL')!;

    this.client = postgres(url, {
      prepare: false,
      max: this.configService.get<number>('DB_POOL_MAX'),
      idle_timeout: this.configService.get<number>('DB_POOL_IDLE_TIMEOUT'),
      max_lifetime: this.configService.get<number>('DB_POOL_MAX_LIFETIME'),
      ssl: url.includes('supabase') ? 'require' : undefined,
    });
    this.db = drizzle(this.client, { schema });

    try {
      await this.db.execute('SELECT 1');
      this.logger.log('Database connected');
    } catch (err) {
      this.logger.error('Database connection failed', err);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.end();
    }
  }
}
