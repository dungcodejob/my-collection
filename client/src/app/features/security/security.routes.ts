import { Routes } from "@angular/router";
import { SecurityStore } from "./data-access";

export const securityRoutes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./containers/login/login.component").then(m => m.LoginComponent),
    providers: [SecurityStore],
    // canActivate: [noAuthGuard],
    // providers: [LoginPageFacade],
  },
];
