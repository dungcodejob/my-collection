import { Routes } from "@angular/router";
import { BookmarkManagementComponent } from "./containers/bookmark-management/bookmark-management.component";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [],
    component: BookmarkManagementComponent,
  },
];
