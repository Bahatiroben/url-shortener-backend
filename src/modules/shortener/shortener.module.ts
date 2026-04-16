import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UrlMapping } from './entities/url-mapping.entity';
import { Click } from './entities/click.entity';

import { ShortenerService } from './services';
import { RedirectService } from './services';
import { KeyGeneratorService } from './services';

import { ShortenerController } from './shortener.controller';
import { RedirectController } from './redirect.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UrlMapping, Click]),
  ],
  providers: [
    ShortenerService,
    RedirectService,
    KeyGeneratorService,
  ],
  controllers: [
    ShortenerController,
    RedirectController,
  ],
  exports: [
    ShortenerService,
    RedirectService,
  ],
})
export class ShortenerModule {}