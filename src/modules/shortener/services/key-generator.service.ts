// src/shortener/key-generator.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/redis/redis.service'; // Assume you have Redis module
import { UrlMapping } from '../entities';

@Injectable()
export class KeyGeneratorService implements OnModuleInit {
  private readonly KEY_BUFFER_SIZE = 1000;
  private readonly REDIS_KEY_BUFFER = 'url_shortener:key_buffer';

  constructor(
    @InjectRepository(UrlMapping)
    private readonly urlRepository: Repository<UrlMapping>,

    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.preloadKeys();
  }

  private async preloadKeys() {
    const count = await this.redisService.getListLength(this.REDIS_KEY_BUFFER);
    if (count < this.KEY_BUFFER_SIZE / 2) {
      await this.generateAndStoreKeys(this.KEY_BUFFER_SIZE);
    }
  }

  private async generateAndStoreKeys(count: number) {
    const keys: string[] = [];
    let lastId = await this.getLastUsedId();

    for (let i = 0; i < count; i++) {
      lastId++;
      const key = this.encodeBase62(lastId);
      keys.push(key);
    }

    await this.redisService.pushToList(this.REDIS_KEY_BUFFER, keys);
  }

  async generateUniqueKey(): Promise<string> {
    let key = await this.redisService.popFromList(this.REDIS_KEY_BUFFER);

    if (!key) {
      await this.generateAndStoreKeys(this.KEY_BUFFER_SIZE);
      key = await this.redisService.popFromList(this.REDIS_KEY_BUFFER);
    }

    // Double-check uniqueness (safety net)
    const exists = await this.urlRepository.exists({ where: { shortKey: key } });
    if (exists) {
      return this.generateUniqueKey(); // recursive retry (rare)
    }

    return key;
  }

  private encodeBase62(num: number): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let encoded = '';
    let n = num;

    do {
      encoded = chars[n % 62] + encoded;
      n = Math.floor(n / 62);
    } while (n > 0);

    return encoded.padStart(7, '0'); // Minimum 7 characters
  }

  private async getLastUsedId(): Promise<number> {
    const result = await this.urlRepository
      .createQueryBuilder('url')
      .select('MAX(url.id)', 'max')
      .getRawOne();

    return result?.max || 1000000; // Start from a safe number
  }
}