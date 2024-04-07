import { ClassProvider, InjectionToken, inject } from "@angular/core";

import { BookmarkImplApi } from "./bookmark-impl.api";
import { BookmarkDtoMockImplApi } from "./bookmark-mock-impl.api";
import { BookmarkApi } from "./bookmark.api";

export * from "./bookmark.store";

const BOOKMARK_API = new InjectionToken("bookmark-api-token");

type ProvideFn = () => ClassProvider;

export const provideBookmarkApi: ProvideFn = () => ({
  provide: BOOKMARK_API,
  useClass: BookmarkImplApi,
});

export const provideBookmarkMockApi: ProvideFn = () => ({
  provide: BOOKMARK_API,
  useClass: BookmarkDtoMockImplApi,
});

export const injectBookmarkApi = () => inject<BookmarkApi>(BOOKMARK_API);
