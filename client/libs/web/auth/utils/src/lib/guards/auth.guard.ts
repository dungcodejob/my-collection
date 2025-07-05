import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthStore } from "@client/web-auth-data-access";
import { RedirectService } from "@client/web-shared-services";

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const redirectService = inject(RedirectService);

  const isAuthenticated = authStore.isAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  return redirectService.createLoginUrlTree(state.url);
};
