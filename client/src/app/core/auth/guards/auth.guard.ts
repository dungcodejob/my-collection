import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { RedirectService } from "@shared/services";
import { AuthService } from "./../data-access/auth.service";

export const authGuard: CanActivateFn = () => {
  const redirectService = inject(RedirectService);
  const authService = inject(AuthService);

  if (!authService.$isLoggedIn()) {
    return redirectService.createLoginTree();
  }

  return true;
};
