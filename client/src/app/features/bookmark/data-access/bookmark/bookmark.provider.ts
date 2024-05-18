import { createInjectionApiToken } from "@shared/utils";
import { BookmarkImplApi } from "./bookmark-impl.api";
import { BookmarkMockApi } from "./bookmark-mock.api";
import { BookmarkApi } from "./bookmark.api";

export const [injectBookmarkApi, provideBookmarkApi, provideBookmarkMockApi] =
  createInjectionApiToken<BookmarkApi>(BookmarkImplApi, BookmarkMockApi);
