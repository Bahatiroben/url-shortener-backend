import { Controller, Get, Post } from '@nestjs/common';
import { LinksService } from './links.service';
import { createLinkDTO } from './dto/createLink.dto';

@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}
  @Get()
  findAll() {
    return this.linksService;
  }

  @Get(':id')
  findOne() {
    
  }

  @Post()
  create(link: createLinkDTO) {
    return this.linksService.create(link)
  }
}
