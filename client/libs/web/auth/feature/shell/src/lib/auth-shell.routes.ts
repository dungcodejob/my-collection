import { Routes } from "@angular/router";
import { AuthLogin } from "@client/web-auth-feature-login";
export const AuthShellRoutes: Routes = [
  {
    path: "login",
    component: AuthLogin,

    // loadComponent: async () =>
    //   (await import("@nx/web-auth-feature-login")).AuthLoginComponent,
  },
];
