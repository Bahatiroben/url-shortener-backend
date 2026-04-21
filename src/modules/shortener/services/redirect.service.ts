import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlMapping } from '../entities';
import { ShortenerService } from './shortener.service';
import { RedisService } from 'src/common/redis/services/redis.service';

@Injectable()
export class RedirectService {
  constructor(
    @InjectRepository(UrlMapping)
    private readonly urlRepository: Repository<UrlMapping>,

    private readonly shortenerService: ShortenerService,

    private readonly redisService: RedisService,
  ) {}

  /**
   * Main method called by controller for redirects
   * Optimized for speed + caching readiness
   */
  async resolveShortKey(shortKey: string): Promise<string> {
    // Try to get from cache first in real implementation (Redis)
    const cachedUrl = await this.redisService.getCachedUrl(shortKey);
    if (cachedUrl) {
      this.shortenerService.incrementClickCount(shortKey).catch(console.error);
      // TODO: Optionally, we could also refresh the TTL here to keep hot links in cache longer to keep the most popular links cached. This would require a separate method in RedisService to update TTL without fetching the value again.
      return cachedUrl;
    }

    // If none found, we hit DB

    const mapping = await this.urlRepository.findOne({
      where: { shortKey, isActive: true },
      select: ['longUrl', 'expiresAt'],
    });

    // Check expiration and active status
    if ((mapping?.expiresAt && mapping.expiresAt < new Date())) {
      throw new NotFoundException('This link is no longer active');
    }

    // Increment click count asynchronously (don't block redirect)
    // todo: add a proper catch handler that will log the error instead of just console.error

    this.shortenerService.incrementClickCount(shortKey).catch(console.error);

    // Cache the result for future requests (with a reasonable TTL, e.g., 1 hour)
    // add an optimistic caching to avoid blocking the redirect flow.
    this.redisService.cacheUrl(shortKey, mapping.longUrl, 3600).catch(console.error);

    return mapping.longUrl;
  }
}