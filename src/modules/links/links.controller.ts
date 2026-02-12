import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { LinksService } from './links.service';
import { createLinkDTO } from './dto/createLink.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}
  // @Get()
  // findAll() {
  //   return this.linksService.getAll();
  // }

  // @Get(':id')
  // findOne(@Query() id: number) {
  //   return this.linksService.findBy({id})
  // }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() link: createLinkDTO, @Request() request: any) {
    return this.linksService.create(link, request.user.id as string)
  }
 
  
}
