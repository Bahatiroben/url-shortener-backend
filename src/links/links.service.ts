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

        return this.linkRepository.create({...link, shortUrl, validUntil, isActive})
    }
    
    async getAll(): Promise<Link[]> {
        return this.linkRepository.find()
    }

    async findBy(params: ILink): Promise<Link[]>{
        return this.linkRepository.find({
            where: params
        })
    }
}
