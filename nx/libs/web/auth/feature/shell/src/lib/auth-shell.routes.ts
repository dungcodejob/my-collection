import { Routes } from "@angular/router";
import { AuthLoginComponent } from "@nx/web-auth-feature-login";
export const AuthShellRoutes: Routes = [
  {
    path: "login",
    component: AuthLoginComponent,
    // loadComponent: async () =>
    //   (await import("@nx/web-auth-feature-login")).AuthLoginComponent,
  },
];
