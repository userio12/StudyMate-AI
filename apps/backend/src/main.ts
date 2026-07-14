import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { RedisIoAdapter } from './redis-io.adapter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ].filter(Boolean) as string[],
    credentials: true,
  });

  app.use(helmet());

  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis(redisUrl);
    app.useWebSocketAdapter(redisIoAdapter);
  }

  const config = new DocumentBuilder()
    .setTitle('StudyMate AI API')
    .setDescription('The StudyMate AI API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`StudyMate backend running on http://localhost:${port}/api`);
}

bootstrap().catch(console.error);
