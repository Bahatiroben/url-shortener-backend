import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { UrlMapping } from './entities/url-mapping.entity';
import { CreateShortLinkDto, UpdateLinkDto } from './dtos';
import { KeyGeneratorService } from './key-generator.service';   

@Injectable()
export class ShortenerService extends BaseService<
  UrlMapping,
  CreateShortLinkDto,
  UpdateLinkDto
> {
  constructor(
    @InjectRepository(UrlMapping)
    protected readonly repository: Repository<UrlMapping>,

    private readonly keyGeneratorService: KeyGeneratorService,   // For generating short keys
  ) {
    super(repository);
  }

  async createShortLink(userId: string, dto: CreateShortLinkDto): Promise<UrlMapping> {
    let shortKey = dto.customAlias;

    // Handle custom alias
    if (shortKey) {
      const exists = await this.repository.exists({ where: { shortKey } });
      if (exists) {
        throw new ConflictException('Custom alias is already taken');
      }
    } else {
      // Auto-generate short key
      shortKey = await this.keyGeneratorService.generateUniqueKey();
    }

    const mapping = this.repository.create({
      shortKey,
      longUrl: dto.longUrl,
      title: dto.title,
      description: dto.description,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      passwordHash: dto.password ? /* hash it */ dto.password : null,
      userId,
      teamId: dto.teamId,
      customDomainId: dto.customDomainId,
      isActive: true,
    });

    return await this.repository.save(mapping);
  }

  async findByShortKey(shortKey: string): Promise<UrlMapping> {
    const mapping = await this.repository.findOne({
      where: { shortKey, isActive: true },
    });

    if (!mapping) {
      throw new NotFoundException('Short link not found or expired');
    }

    // Check expiration
    if (mapping.expiresAt && mapping.expiresAt < new Date()) {
      throw new NotFoundException('This link has expired');
    }

    return mapping;
  }

  async incrementClickCount(shortKey: string): Promise<void> {
    await this.repository.increment({ shortKey }, 'clickCount', 1);
  }

  // Override update to add business checks
  async update(shortKey: string, updateDto: UpdateLinkDto): Promise<UrlMapping> {
    const link = await this.findByShortKey(shortKey);
    Object.assign(link, updateDto);
    return await this.repository.save(link);
  }
}