import { ClassProvider, InjectionToken, inject } from "@angular/core";

import { BookmarkImplApi } from "./bookmark-impl.api";
import { BookmarkApi } from "./bookmark.api";

export * from "./bookmark.store";

const BOOKMARK_API = new InjectionToken("bookmark-api-token");

type ProvideFn = () => ClassProvider;

export const provideBookmarkApi: ProvideFn = () => ({
  provide: BOOKMARK_API,
  useClass: BookmarkImplApi,
});

export const injectBookmarkApi = () => inject<BookmarkApi>(BOOKMARK_API);
