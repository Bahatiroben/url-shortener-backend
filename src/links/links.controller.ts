import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LinksService } from './links.service';
import { createLinkDTO } from './dto/createLink.dto';

@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}
  @Get()
  findAll() {
    return this.linksService.getAll();
  }

  @Get(':id')
  findOne(@Query() id: number) {
    return this.linksService.findBy({id})
  }

  @Post()
  create(@Body() link: createLinkDTO) {
    return this.linksService.create(link)
  }

  
}
