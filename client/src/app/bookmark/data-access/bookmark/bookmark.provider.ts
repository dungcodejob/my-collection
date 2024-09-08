import { Provider, isDevMode } from "@angular/core";
import { createInjectionApiToken } from "@shared/utils";
import { BookmarkImplApi } from "./bookmark-impl.api";
import { BookmarkMockApi } from "./bookmark-mock.api";
import { BookmarkApi } from "./bookmark.api";
import { BookmarkFacade } from "./bookmark.facade";

export const [injectBookmarkApi, provideBookmarkApi, provideBookmarkMockApi] =
  createInjectionApiToken<BookmarkApi>(BookmarkImplApi, BookmarkMockApi);

export const provideBookmark = (): Provider => {
  const provideApi = isDevMode() ? provideBookmarkMockApi : provideBookmarkApi;
  return [provideApi(), BookmarkFacade];
};
