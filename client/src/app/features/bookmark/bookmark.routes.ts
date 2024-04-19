import { Routes } from "@angular/router";
import { BookmarkManagementComponent } from "./containers/bookmark-management/bookmark-management.component";
import {
  BookmarkDetailStore,
  BookmarkStore,
  TagStore,
  provideBookmarkMockApi,
  provideCrawlApi,
  provideTagMockApi,
} from "./data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [
      // provideBookmarkApi(),
      provideBookmarkMockApi(),
      provideCrawlApi(),
      provideTagMockApi(),
      BookmarkStore,
      BookmarkDetailStore,
      TagStore,
    ],
    component: BookmarkManagementComponent,
  },
];
