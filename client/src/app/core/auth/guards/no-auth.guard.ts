import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { RedirectService } from "@shared/services";
import { map } from "rxjs";
import { AuthService } from "./../data-access/auth.service";

export const noAuthGuard: CanActivateFn = () => {
  const redirectService = inject(RedirectService);
  const authService = inject(AuthService);

  // TODO: create Redirect Service
  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => (isLoggedIn ? redirectService.createHomeTree() : true))
  );
};
