import { ClassProvider, InjectionToken, inject } from "@angular/core";
import { CrawlImplApi } from "./crawl-impl.api";
import { CrawlApi } from "./crawl.api";

const CRAWL_API = new InjectionToken("crawl-api-token");

export const provideCrawlApi = (): ClassProvider => ({
  provide: CRAWL_API,
  useClass: CrawlImplApi,
});

export const injectCrawlApi = () => inject<CrawlApi>(CRAWL_API);
