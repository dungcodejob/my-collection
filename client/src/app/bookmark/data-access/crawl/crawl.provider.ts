import { createInjectionApiToken } from "@shared/utils";
import { CrawlImplApi } from "./crawl-impl.api";
import { CrawlApi } from "./crawl.api";

export const [injectCrawlApi, provideCrawlApi] =
  createInjectionApiToken<CrawlApi>(CrawlImplApi);
