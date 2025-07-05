import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthStore } from "@client/web-auth-data-access";
import { RedirectService } from "@client/web-shared-services";

export const guestAuthGuard: CanActivateFn = () => {
  const redirectService = inject(RedirectService);
  const authStore = inject(AuthStore);

  if (authStore.isAuthenticated()) {
    // return redirectService.createHomeTree();
  }

  return true;
};
