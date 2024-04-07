import { Routes } from "@angular/router";
import { authGuard, noAuthGuard } from "@core/auth";
import { LayoutComponent } from "@shell/containers/layout/layout.component";
import { NotAuthorizedComponent } from "@shell/containers/not-authorized/not-authorized.component";
import { ShellStore } from "@shell/data-access";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    canActivate: [authGuard],
    component: LayoutComponent,
    providers: [ShellStore],
    children: [
      {
        path: ":collectionId",
        loadChildren: () =>
          import("@bookmark/bookmark.routes").then(m => m.bookmarkRoutes),
      },
      {
        path: "collection",
        loadChildren: () =>
          import("@collection/collection.routes").then(m => m.collectionRoutes),
        outlet: "sidebar",
      },
    ],
  },

  {
    path: "security",
    canActivate: [noAuthGuard],
    loadChildren: () => import("@security/security.routes").then(m => m.securityRoutes),
  },
  {
    path: "not-authorized",
    component: NotAuthorizedComponent,
    data: { preload: true },
  },
];
