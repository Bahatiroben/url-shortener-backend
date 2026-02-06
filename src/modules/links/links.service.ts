import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './links.entity';
import { ILink } from './interfaces';
import { Utils } from './utils';

@Injectable()
export class LinksService {

    constructor(
        @InjectRepository(Link)
        private linkRepository: Repository<Link>,
        private utils: Utils
    ) {

    }

    async create(link: ILink): Promise<Link> {
        const shortUrl = this.utils.createShortUrl()
        const validUntil = this.utils.getUrlValidUntilDate();
        const isActive = validUntil && true; // active should depend on whether the valid until was found
        
        return this.linkRepository.save({...link, shortUrl, validUntil, isActive});
    }

    async update(id: number, partialLink: ILink): Promise<Link> {
        return (await this.linkRepository.update({id}, partialLink)).raw;
    }
    
    async getAll(): Promise<Link[]> {
        return this.linkRepository.find()
    }

    async findBy(params: ILink): Promise<Link[]>{
        return this.linkRepository.find({
            where: params
        })
    }

    async deleteById(id: number): Promise<number> {
        return (await this.linkRepository.softDelete(id)).affected;
    }
}
