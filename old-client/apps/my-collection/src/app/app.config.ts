import {
  ApplicationConfig,
  EnvironmentProviders,
  Provider,
  inject,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAppInitWithConfigAsync, providerConfig } from "@nx/web-shared-app-config";
import { webShellRoutes } from "@nx/web-shell-feature";
import { provideAppHttp } from "@nx/web-shared-http";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthStore } from "@nx/web-auth-data-access";
import { authInterceptor } from "@nx/web-auth-utils";

const provideAuth = (): EnvironmentProviders | Provider => [
  provideHttpClient(
    withInterceptors([
      authInterceptor,
      // fakeBackendInterceptor,
    ])
  ),
  provideAppInitWithConfigAsync(() => {
    const authStore = inject(AuthStore);
    return () => authStore.initializer();
  }),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    providerConfig(),
    provideAppHttp(),
    provideAuth(),
    provideRouter(webShellRoutes),
  ],
};
