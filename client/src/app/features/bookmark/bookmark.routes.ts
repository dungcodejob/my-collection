import { Routes } from "@angular/router";
import { BookmarkManagementComponent } from "./containers/bookmark-management/bookmark-management.component";
import { BookmarkStore, provideBookmarkApi } from "./data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [provideBookmarkApi(), BookmarkStore],
    component: BookmarkManagementComponent,
  },
];
