import { Result } from '@common/models';
import { Controller, Get, Query } from '@nestjs/common';
import { CrawlService } from './services';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly _crawlService: CrawlService) {}

  @Get('metadata')
  async getMetadata(@Query('url') url: string) {
    const metadata = await this._crawlService.getMetadata(url);
    return Result.toSingle(metadata);
  }
}
