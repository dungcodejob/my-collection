import { Routes } from "@angular/router";
import { AuthShellRoutes } from "@client/web-auth-feature-shell";
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
    providers: [],
    // children: [
    //   {
    //     path: ':collectionId',
    //     loadChildren: () => import('./bookmark').then((m) => m.bookmarkRoutes),
    //   },
    // ],
  },
  {
    path: "auth",
    children: AuthShellRoutes,
    // loadChildren: async () =>
    //   (await import("@nx/web-auth-feature-shell")).AuthShellRoutes,
  },
];
