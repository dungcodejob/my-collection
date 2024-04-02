import { Routes } from "@angular/router";

export const collectionRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./containers/bookmark-management/bookmark-management.component").then(
        m => m.BookmarkManagementComponent
      ),
  },
];
