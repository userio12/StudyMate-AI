import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AiModule } from './ai/ai.module.js';
import { HealthController } from './health.controller.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, DatabaseModule, StorageModule, AiModule],
      controllers: [HealthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  it('GET /api/health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });

  it('GET /api/ready returns status with checks', async () => {
    const res = await request(app.getHttpServer()).get('/api/ready');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: expect.any(String),
      checks: expect.any(Object),
      timestamp: expect.any(String),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
