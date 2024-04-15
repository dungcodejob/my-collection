import { Routes } from "@angular/router";
import { BookmarkManagementComponent } from "./containers/bookmark-management/bookmark-management.component";
import { BookmarkStore, provideBookmarkApi, provideCrawlApi } from "./data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [
      provideBookmarkApi(),
      // provideBookmarkMockApi(),
      provideCrawlApi(),
      BookmarkStore,
    ],
    component: BookmarkManagementComponent,
  },
];
