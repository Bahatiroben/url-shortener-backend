import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'; 

@Injectable()
export abstract class BaseService<Entity, CreateDto = any, UpdateDto = any> {
  protected constructor(protected readonly repository: Repository<Entity>) {}

  /**
   * Find all entities with pagination support
   */
  async findAll(
    options: {
      page?: number;
      limit?: number;
      where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[];
      relations?: string[];
      order?: any;
      search?: string;
    } = {},
  ): Promise<{ items: Entity[]; total: number }> {
    const { page = 1, limit = 20, where = {}, relations = [], order = { createdAt: 'DESC' } } = options;

    const skip = (page - 1) * limit;

    const [items, total] = await this.repository.findAndCount({
      where,
      relations,
      order,
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * Find one entity by ID or throw NotFoundException
   */
  async findOne(id: string | number, relations: string[] = []): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    return entity;
  }

  /**
   * Find one by custom condition (useful for shortKey)
   */
  async findOneBy(
    conditions: FindOptionsWhere<Entity>,
    relations: string[] = [],
  ): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: conditions,
      relations,
    });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    return entity;
  }

  /**
   * Create a new entity
   */
  async create(createDto: CreateDto): Promise<Entity> {
    const entity = this.repository.create(createDto as any);
    return await this.repository.save(entity) as Entity;
  }

  /**
   * Update an entity
   */
  async update(id: string | number, updateDto: UpdateDto): Promise<Entity> {
    const entity = await this.findOne(id);

    Object.assign(entity, updateDto);
    return await this.repository.save(entity);
  }

  /**
   * Soft delete (if your entities support isActive) or hard delete
   */
  async remove(id: string | number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  /**
   * Soft delete using isActive flag (recommended for URL shortener)
   */
  async softDelete(id: string | number): Promise<void> {
    const entity = await this.findOne(id);
    
    if ((entity as any)?.isActive !== undefined) {
      (entity as any).isActive = false;
      await this.repository.save(entity);
    } else {
      await this.remove(id);
    }
  }

  /**
   * Count entities
   */
  async count(where?: FindOptionsWhere<Entity>): Promise<number> {
    return await this.repository.count({ where });
  }

  /**
   * Check if entity exists
   */
  async exists(conditions: FindOptionsWhere<Entity>): Promise<boolean> {
    return await this.repository.exists({ where: conditions });
  }

  /**
   * Bulk create (useful for future bulk import feature)
   */
  async bulkCreate(createDtos: CreateDto[]): Promise<Entity[]> {
    const entities = this.repository.create(createDtos as any[]);
    return await this.repository.save(entities);
  }

  /**
   * Custom query wrapper for complex cases
   */
  protected async executeQuery<T, R>(
    queryFn: (params?: R) => Promise<T>,
    params?: R,
  ): Promise<T> {
    try {
      return await queryFn(params);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Basic database error handler
   */
  protected handleDatabaseError(error: any): never {
    switch (error.code) {
        // --- Data Integrity Errors (Typically 400 or 409) ---
        case '23505': // unique_violation
            throw new BadRequestException('Duplicate entry detected');
        case '23503': // foreign_key_violation
            throw new BadRequestException('Related entity not found or still in use');
        case '23502': // not_null_violation
            throw new BadRequestException('Required field missing');
        case '23514': // check_violation
            throw new BadRequestException('Input data violates business rules');
        // --- Data/Syntax Errors (Typically 400) ---
        case '22P02': // invalid_text_representation
            throw new BadRequestException('Invalid data format provided');
        case '22001': // string_data_right_truncation
            throw new BadRequestException('Input is too long for the field');
        case '42703': // undefined_column (often caused by bad query mapping)
            throw new BadRequestException('Invalid query parameters');

        // --- Transaction/Concurrency Errors (Might need 409 or retry) ---
        case '40P01': // deadlock_detected
            throw new BadRequestException('A database conflict occurred; please try again');

        // --- Connectivity/Server Errors (Typically 500/503) ---
        case '08006': // connection_failure
        case '57P01': // admin_shutdown
            throw new BadRequestException('Database is currently unavailable');

        default:
            // Log the actual error code here to track unhandled cases
            throw new BadRequestException('Database operation failed');
    }
  }
}