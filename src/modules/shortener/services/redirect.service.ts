import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlMapping } from '../entities';
import { RedirectResult } from '../dtos';
import { ShortenerService } from './shortener.service';

@Injectable()
export class RedirectService {
  constructor(
    @InjectRepository(UrlMapping)
    private readonly urlRepository: Repository<UrlMapping>,

    private readonly shortenerService: ShortenerService,   // Reuse logic
  ) {}

  /**
   * Main method called by controller for redirects
   * Optimized for speed + caching readiness
   */
  async resolveShortKey(shortKey: string): Promise<RedirectResult> {
    // Try to get from cache first in real implementation (Redis)
    // For now, we hit DB

    const mapping = await this.urlRepository.findOne({
      where: { shortKey },
      select: ['longUrl', 'shortKey', 'title', 'expiresAt', 'passwordHash', 'isActive'],
    });

    if (!mapping) {
      throw new NotFoundException('Short link not found');
    }

    if (!mapping.isActive) {
      throw new NotFoundException('This link is no longer active');
    }

    // Check expiration
    if (mapping.expiresAt && mapping.expiresAt < new Date()) {
      throw new NotFoundException('This link has expired');
    }

    // Increment click count asynchronously (don't block redirect)
    this.shortenerService.incrementClickCount(shortKey).catch(console.error);

    return {
      longUrl: mapping.longUrl,
      shortKey: mapping.shortKey,
      title: mapping.title,
      expiresAt: mapping.expiresAt,
      passwordHash: mapping.passwordHash,
      isActive: mapping.isActive,
    };
  }
}