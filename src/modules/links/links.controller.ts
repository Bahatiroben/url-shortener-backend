import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, ParseUUIDPipe } from '@nestjs/common';
import { LinksService } from './links.service';
import { createLinkDTO } from './dto/createLink.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}
  @Get()
  findAll(@Request() request: any, @Query() queryParams: any) {
    const filters = queryParams.filters;
    const userId = request.user?.id;
    return this.linksService.findBy({userId}, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.linksService.findById(id)
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() link: createLinkDTO, @Request() request: any) {
    return this.linksService.create(link, request.user.id as string)
  }
 
  
}
