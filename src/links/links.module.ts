import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { Link } from './links.entity';
import { Utils } from './utils';

@Module({
  imports: [TypeOrmModule.forFeature([Link])],
  providers: [LinksService, Utils],
  controllers: [LinksController],
  exports: [TypeOrmModule, Utils]
})
export class LinksModule {}