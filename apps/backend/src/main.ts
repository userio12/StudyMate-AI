import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(helmet());

  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`StudyMate backend running on http://localhost:${port}/api`);
}

bootstrap();
