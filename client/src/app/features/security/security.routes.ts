import { Routes } from "@angular/router";
import { noAuthGuard } from "@core/auth";

export const securityRoutes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./containers/login/login.component").then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
];
