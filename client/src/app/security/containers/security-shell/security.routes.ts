import { Routes } from "@angular/router";
import { noAuthGuard } from "@core/auth";

export const securityRoutes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("../security-login/security-login.component").then(
        m => m.SecurityLoginComponent
      ),
    canActivate: [noAuthGuard],
  },
];
