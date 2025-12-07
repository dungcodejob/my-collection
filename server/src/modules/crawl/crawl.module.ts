import { Module } from '@nestjs/common';
import { CrawlController } from './crawl.controller';
import { CrawlMapper } from './crawl.mapper';
import { CrawlService } from './crawl.service';

@Module({
  controllers: [CrawlController],
  providers: [CrawlService, CrawlMapper],
  exports: [CrawlService, CrawlMapper],
})
export class CrawlModule {}
