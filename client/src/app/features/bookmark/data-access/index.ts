import { ClassProvider, InjectionToken, inject } from "@angular/core";

import { BookmarkImplApi } from "./bookmark-impl.api";
import { BookmarkApi } from "./bookmark.api";
import { CrawlImplApi } from "./crawl-impl.api";
import { CrawlApi } from "./crawl.api";

export * from "./bookmark.store";

type ProvideFn = () => ClassProvider;

const BOOKMARK_API = new InjectionToken("bookmark-api-token");

export const provideBookmarkApi: ProvideFn = () => ({
  provide: BOOKMARK_API,
  useClass: BookmarkImplApi,
});

export const injectBookmarkApi = () => inject<BookmarkApi>(BOOKMARK_API);

const CRAWL_API = new InjectionToken("crawl-api-token");

export const provideCrawlApi: ProvideFn = () => ({
  provide: CRAWL_API,
  useClass: CrawlImplApi,
});

export const injectCrawlApi = () => inject<CrawlApi>(CRAWL_API);
