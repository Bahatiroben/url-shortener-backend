import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RedirectService } from './services';

@Controller('v1')
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':shortKey')
  async redirect(@Param('shortKey') shortKey: string, @Res() res: Response) {
    const longUrl = await this.redirectService.resolveShortKey(shortKey);

    // 301 Permanent Redirect (best for SEO and caching)
    return res.redirect(HttpStatus.MOVED_PERMANENTLY, longUrl);
  }

  // Support custom domains later: @Get(':domain/:shortKey')
}