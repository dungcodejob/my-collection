import { Routes } from "@angular/router";
import { BookmarkManagementComponent } from "./containers/bookmark-management/bookmark-management.component";
import { BookmarkStore, provideBookmarkMockApi, provideCrawlApi } from "./data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [provideBookmarkMockApi(), provideCrawlApi(), BookmarkStore],
    component: BookmarkManagementComponent,
  },
];
