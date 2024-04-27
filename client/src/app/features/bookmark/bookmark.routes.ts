import { Routes } from "@angular/router";
import { BookmarkManagementComponent } from "./containers/bookmark-management/bookmark-management.component";
import { provideBookmarkApi, provideCrawlApi, provideTagApi } from "./data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [
      provideBookmarkApi(),
      // provideBookmarkMockApi(),
      provideCrawlApi(),
      provideTagApi(),
      // provideTagMockApi(),
    ],
    component: BookmarkManagementComponent,
  },
];
