// src/common/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      db: this.configService.get<number>('redis.db'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // List operations (used by KeyGenerator)
  async pushToList(key: string, values: string[]): Promise<void> {
    if (values.length === 0) return;
    await this.client.rpush(key, ...values);
  }

  async popFromList(key: string): Promise<string | null> {
    return this.client.lpop(key);
  }

  async getListLength(key: string): Promise<number> {
    return this.client.llen(key);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  // Cache helper for URL mappings (very important for redirects)
  async cacheUrl(shortKey: string, longUrl: string, ttlSeconds: number = 3600): Promise<void> {
    await this.set(`url:${shortKey}`, longUrl, ttlSeconds);
  }

  async getCachedUrl(shortKey: string): Promise<string | null> {
    return this.get(`url:${shortKey}`);
  }

  // Click analytics buffer (optional)
  async addToClickBuffer(data: any): Promise<void> {
    await this.client.rpush('click_buffer', JSON.stringify(data));
  }

  onModuleDestroy() {
    this.client.quit();
  }
}