import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BaseController } from '../../common/base/base.controller';
import { ShortenerService } from './services';
import { CreateShortLinkDto, UpdateLinkDto } from './dtos';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('v1/links')
export class ShortenerController extends BaseController {
  constructor(private readonly shortenerService: ShortenerService) {
    super();
  }

  @Post()
  async shorten(@Body() dto: CreateShortLinkDto, req: any) {
    return this.createResponse(
      () => this.shortenerService.createShortLink(req.user?.id || null, dto),
      'URL shortened successfully'
    );
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20, req: any) {
    return this.listResponse(
      () => this.shortenerService.findAll({ page: +page, limit: +limit, where: { userId: req.user.id } }),
      +page,
      +limit
    );
  }

  @Get(':shortKey')
  async findOne(@Param('shortKey') shortKey: string) {
    return this.execute(
      () => this.shortenerService.findByShortKey(shortKey),
      'Link retrieved successfully'
    );
  }

  
  @Patch(':shortKey')
  async update(@Param('shortKey') shortKey: string, @Body() dto: UpdateLinkDto) {
    return this.updateResponse(
      () => this.shortenerService.update(shortKey, dto),
      'Link updated successfully'
    );
  }

  @Delete(':shortKey')
  async remove(@Param('shortKey') shortKey: string) {
    return this.deleteResponse(
      () => this.shortenerService.softDelete(shortKey),
      'Link deleted successfully'
    );
  }
}