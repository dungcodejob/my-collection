import { Routes } from "@angular/router";
import { noAuthGuard } from "@core/auth";
import { LoginStore } from "./data-access/login.store";

export const securityRoutes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./containers/login/login.component").then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
    providers: [LoginStore],
  },
];
