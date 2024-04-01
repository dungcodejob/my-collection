import { Routes } from "@angular/router";
import { authGuard, noAuthGuard } from "@core/auth";
import { LayoutComponent } from "@shell/containers/layout/layout.component";
import { NotAuthorizedComponent } from "@shell/containers/not-authorized/not-authorized.component";

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
