import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, ParseUUIDPipe, Delete, Patch, HttpCode, UseInterceptors, BadRequestException, UploadedFile, Req } from '@nestjs/common';
import { LinksService } from './links.service';
import { createLinkDTO } from './dto/createLink.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { IUpdateLink } from './interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@UseGuards(AuthGuard)
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

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.linksService.deleteByIds(id);
  }

  @Post()
  create(@Body() link: createLinkDTO, @Request() request: any) {
    return this.linksService.create(link, request.user.id as string)
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() partialLink: IUpdateLink) {
    return this.linksService.update(id, partialLink);
  }
 
  @Post('create-multiple')
  createMultiple(@Body() links: createLinkDTO[], @Request() request: any) {
    return Promise.all(links.map((link) => this.linksService.create(link, request.user.id as string)));
  }

  @Post('upload-csv')
  uploadCSV(@Body() links: createLinkDTO[], @Request() request: any) {
    return this.linksService.createMultiple(links, request.user.id as string);
  }

  @Post('import/csv')
  @HttpCode(HttpStatus.MULTI_STATUS) // 207
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const isCsv =
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          file.originalname.endsWith('.csv');

        isCsv
          ? cb(null, true)
          : cb(new BadRequestException('Only CSV files are allowed'), false);
      },
    }),
  )
  async importCsv(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('No file uploaded');

    return this.linksService.importFromCsv(file.buffer, req.user.id);
  }
}
