import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessThanOrEqual, Equal, MoreThanOrEqual } from 'typeorm';
import { Link } from './links.entity';
import { IFindLinksBy, IUpdateLink, IGetLInksBy } from './interfaces';
import { Utils } from './utils';
import { createLinkDTO } from './dto/createLink.dto';
import { Readable } from 'stream';

@Injectable()
export class LinksService {
  // update these values based on my actual schema of thte links

  private readonly URL_COLUMNS = ['url', 'URL', 'link', 'long_url', 'destination'];
  private readonly ALIAS_COLUMNS = ['alias', 'custom_alias', 'slug'];
  private readonly TITLE_COLUMNS = ['title', 'name', 'label'];

    constructor(
        @InjectRepository(Link)
        private linkRepository: Repository<Link>,
        private utils: Utils
    ) {

    }

    async parseCsvBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
    const rows: Record<string, string>[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(buffer)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      throw new BadRequestException('CSV file is empty or malformed');
    }

    return rows;
  }

  // ── Extract & validate URLs from parsed rows ──────────────────────────────
  async extractUrlsFromRows(rows: Record<string, string>[]): Promise<{
    valid: CsvUrlRowDto[];
    errors: { row: number; reason: string; data?: any }[];
  }> {
    const valid: CsvUrlRowDto[] = [];
    const errors: { row: number; reason: string; data?: any }[] = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 1;

      // Detect which column holds the URL
      const urlKey = this.URL_COLUMNS.find((col) => row[col]?.trim());
      if (!urlKey) {
        errors.push({ row: rowNumber, reason: 'No URL column found', data: row });
        continue;
      }

      const aliasKey = this.ALIAS_COLUMNS.find((col) => row[col]?.trim());
      const titleKey = this.TITLE_COLUMNS.find((col) => row[col]?.trim());

      // Map to DTO and validate
      const dto = plainToInstance(CsvUrlRowDto, {
        originalUrl: row[urlKey].trim(),
        alias: aliasKey ? row[aliasKey].trim() : undefined,
        title: titleKey ? row[titleKey].trim() : undefined,
      });

      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        errors.push({
          row: rowNumber,
          reason: Object.values(validationErrors[0].constraints ?? {}).join(', '),
          data: row,
        });
        continue;
      }

      valid.push(dto);
    }

    return { valid, errors };
  }

  // ── Orchestrator: parse → extract → create ────────────────────────────────
  async importFromCsv(buffer: Buffer, userId: string) {
    const rows = await this.parseCsvBuffer(buffer);
    const { valid, errors } = await this.extractUrlsFromRows(rows);

    if (valid.length === 0) {
      throw new BadRequestException({
        message: 'No valid URLs found in CSV',
        errors,
      });
    }

    const { created, failed } = await this.bulkCreate(valid, userId);

    return {
      summary: {
        total: rows.length,
        created: created.length,
        failed: failed.length + errors.length,
      },
      created,
      failed: [...errors, ...failed],
    };
  }

    async findById(id: string): Promise<Link> {
        return this.linkRepository.findOne({
            where: {
                id
            }
        })
    }

    async create(link: createLinkDTO, userId: string): Promise<Link> {
        const shortCode = this.utils.createShortUrl()
        const validUntil = this.utils.getUrlValidUntilDate();
        const isActive = validUntil && true;
        return this.linkRepository.save({...link, shortCode, validUntil, isActive, userId});
    }

    // refactor later to use transactions and bulk insert for better performance
    async createMultiple(links: createLinkDTO[], userId: string): Promise<Link[]> {
        // create multiple links in parallel
        const createdLinks = await Promise.all(links.map(link => this.create(link, userId)));
        return createdLinks;
    }

    async update(id: string, partialLink: IUpdateLink): Promise<Link> {
        return (await this.linkRepository.update({id}, partialLink)).raw;
    }
    
    async getAllBy(getLinkBy: IGetLInksBy): Promise<Link[]> {
        return this.linkRepository.find({
            where: getLinkBy
        })
    }

    async findBy(params: IFindLinksBy, filters?: any): Promise<Link[]>{
        const {isActive, validUntil: {lte, gte, eq}, } = filters || {};
        return this.linkRepository.find({
            where: {
                ...params,
                ...(isActive !== undefined && {isActive}),
                ...(lte && {validUntil: LessThanOrEqual(lte)}),
                ...(gte && {validUntil: MoreThanOrEqual(gte)}),
                ...(eq && {validUntil: Equal(eq)}),
            }
        })
    }
    async deleteByIds(ids: string [] | string): Promise<number> {
        return (await this.linkRepository.softDelete(ids)).affected;
    }
}
