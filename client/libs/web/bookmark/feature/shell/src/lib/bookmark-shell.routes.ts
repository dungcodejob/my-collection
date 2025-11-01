import { Routes } from "@angular/router";
import { BookmarkStore } from "@client/web-bookmark-data-access";
import { MCBookmarkList } from "@client/web-bookmark-feature-list";
export const BookmarkShellRoutes: Routes = [
  {
    path: "",
    component: MCBookmarkList,
    providers: [BookmarkStore],
    // loadComponent: async () =>
    //   (await import("@nx/web-auth-feature-login")).AuthLoginComponent,
  },
];
