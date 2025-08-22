import { Routes } from "@angular/router";
import { MCBookmarkList } from "@client/web-bookmark-feature-list";
export const BookmarkShellRoutes: Routes = [
  {
    path: "",
    component: MCBookmarkList,
    // loadComponent: async () =>
    //   (await import("@nx/web-auth-feature-login")).AuthLoginComponent,
  },
];
