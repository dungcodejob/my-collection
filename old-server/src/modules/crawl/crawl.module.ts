import { Module } from "@nestjs/common";
import { CrawlController } from "./crawl.controller";
import { CrawlService } from "./services";

@Module({
  imports: [],
  providers: [CrawlService],
  controllers: [CrawlController],
})
export class CrawlModule {}
