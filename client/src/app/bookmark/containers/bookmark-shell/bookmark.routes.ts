import { Routes } from "@angular/router";
import {
  BookmarkFacade,
  BookmarkStore,
  provideBookmarkMockApi,
} from "@bookmark/data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [provideBookmarkMockApi(), BookmarkFacade, BookmarkStore],
    loadComponent: () =>
      import("../bookmark-management/bookmark-management.component").then(
        m => m.BookmarkManagementComponent
      ),
  },
];
