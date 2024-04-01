import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";
import { AuthService } from "./../data-access/auth.service";

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // TODO: create Redirect Service
  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => (isLoggedIn ? true : router.createUrlTree(["security/login"])))
  );
};
