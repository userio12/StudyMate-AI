import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (env) => configSchema.parse(env),
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
