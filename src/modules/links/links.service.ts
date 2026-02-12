import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './links.entity';
import { ILink, IUpdateLink, IGetLInksBy } from './interfaces';
import { Utils } from './utils';
import { createLinkDTO } from './dto/createLink.dto';

@Injectable()
export class LinksService {

    constructor(
        @InjectRepository(Link)
        private linkRepository: Repository<Link>,
        private utils: Utils
    ) {

    }

    async create(link: createLinkDTO, userId: string): Promise<Link> {
        const shortCode = this.utils.createShortUrl()
        const validUntil = this.utils.getUrlValidUntilDate();
        const isActive = validUntil && true;
        return this.linkRepository.save({...link, shortCode, validUntil, isActive, userId});
    }

    async update(id: number, partialLink: IUpdateLink): Promise<Link> {
        return (await this.linkRepository.update({id}, partialLink)).raw;
    }
    
    async getAllBy(getLinkBy: IGetLInksBy): Promise<Link[]> {
        return this.linkRepository.find({
            where: getLinkBy
        })
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
