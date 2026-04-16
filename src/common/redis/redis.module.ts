// src/common/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './services';
import redisConfig from '../config/redis.config';

@Global() // Makes RedisService available everywhere
@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}