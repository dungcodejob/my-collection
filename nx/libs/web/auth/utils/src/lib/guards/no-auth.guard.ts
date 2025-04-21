import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthStore } from "@nx/web-auth-data-access";
import { RedirectService } from "@nx/web-shared-services";

export const noAuthGuard: CanActivateFn = () => {
  const redirectService = inject(RedirectService);
  const authStore = inject(AuthStore);

  if (authStore.$isLoggedIn()) {
    return redirectService.createHomeTree();
  }

  return true;
};
