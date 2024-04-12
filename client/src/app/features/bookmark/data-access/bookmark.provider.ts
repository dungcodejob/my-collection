import { ClassProvider, InjectionToken, inject } from "@angular/core";
import { BookmarkImplApi } from "./bookmark-impl.api";
import { BookmarkMockApi } from "./bookmark-mock.api";
import { BookmarkApi } from "./bookmark.api";

const BOOKMARK_API = new InjectionToken<BookmarkApi>("bookmark-api-token");
export const injectBookmarkApi = () => inject(BOOKMARK_API);

export const provideBookmarkApi = (): ClassProvider => ({
  provide: BOOKMARK_API,
  useClass: BookmarkImplApi,
});
export const provideBookmarkMockApi = (): ClassProvider => ({
  provide: BOOKMARK_API,
  useClass: BookmarkMockApi,
});
