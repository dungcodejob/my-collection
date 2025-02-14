import { Route, Routes } from "@angular/router";
export const AuthShellRoutes: Routes = [
  {
    path: "login",
    loadComponent: async () =>
      (await import("@nx/web-auth-feature-login")).AuthLoginComponent,
  },
];
