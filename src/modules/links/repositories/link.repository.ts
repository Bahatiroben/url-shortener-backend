// create a custom repository that receives an entity and creates a query builder for it with some custom methods to handle filters, ...
import { EntityRepository, Repository } from 'typeorm';
import { Link } from '../entities/link.entity';

@EntityRepository(Link)
export class LinkRepository extends Repository<Link> {
  async findBy(filters: any, userId?: string) {
    const query = this.createQueryBuilder('link');
    if (userId) {
      query.andWhere('link.userId = :userId', { userId });
    }
    if (filters) {
      if (filters.url) {
        query.andWhere('link.url LIKE :url', { url: `%${filters.url}%` });
      }
      if (filters.description) {
        query.andWhere('link.description LIKE :description', { description: `%${filters.description}%` });
      }
    }
    return await query.getMany();
  }
}