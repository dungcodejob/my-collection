import { Routes } from "@angular/router";
import { BookmarkListComponent } from "./containers/bookmark-list/bookmark-list.component";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [],
    component: BookmarkListComponent,
  },
];
