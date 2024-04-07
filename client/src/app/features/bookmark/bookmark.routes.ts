import { Routes } from "@angular/router";
import { BookmarkListComponent } from "./containers/bookmark-list/bookmark-list.component";
import { BookmarkStore, provideBookmarkApi } from "./data-access";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [provideBookmarkApi(), BookmarkStore],
    component: BookmarkListComponent,
  },
];
