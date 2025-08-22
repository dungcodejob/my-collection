import { Routes } from "@angular/router";
import { AuthShellRoutes } from "@client/web-auth-feature-shell";
import { CollectionStore } from "@client/web-collection-data-access";
import { MCLayout } from "@client/web-shell-ui-layout";

export const webShellRoutes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    // canActivate: [authGuard],
    component: MCLayout,
    providers: [CollectionStore],
    children: [
      {
        path: ":collectionId",
        loadChildren: () =>
          import("@client/web-bookmark-feature-shell").then(m => m.BookmarkShellRoutes),
      },
    ],
  },
  {
    path: "auth",
    children: AuthShellRoutes,
    // loadChildren: async () =>
    //   (await import("@nx/web-auth-feature-shell")).AuthShellRoutes,
  },
];
