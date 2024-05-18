import { EnvironmentProviders, Provider, inject } from "@angular/core";

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAppInitWithConfigAsync } from "@core/config";
import { AuthService } from "./data-access/auth.service";
import { fakeBackendInterceptor } from "./interceptors/fake-backend.interceptor";

export const provideAuth = (): EnvironmentProviders | Provider => [
  provideHttpClient(
    withInterceptors([
      // authInterceptor,
      fakeBackendInterceptor,
    ])
  ),
  provideAppInitWithConfigAsync(() => {
    const authService = inject(AuthService);
    return () => authService.initializer();
  }),
];
