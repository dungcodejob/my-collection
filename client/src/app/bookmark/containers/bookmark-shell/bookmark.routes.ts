import { Routes } from "@angular/router";

export const bookmarkRoutes: Routes = [
  {
    path: "",
    providers: [],
    loadComponent: () =>
      import("../bookmark-management/bookmark-management.component").then(
        m => m.BookmarkManagementComponent
      ),
  },
];
