import { APP_INITIALIZER, EnvironmentProviders, Provider, inject } from "@angular/core";

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthService } from "./data-access/auth.service";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { fakeBackendInterceptor } from "./interceptors/fake-backend.interceptor";

export const provideAuth = (): EnvironmentProviders | Provider => [
  provideHttpClient(withInterceptors([fakeBackendInterceptor, authInterceptor])),
  {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => {
      const authService = inject(AuthService);
      return () => authService.initializer();
    },
  },
];
