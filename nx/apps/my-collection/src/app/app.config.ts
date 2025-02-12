import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAppConfigInitializer } from "@nx/web-shared-app-config";
import { webShellRoutes } from "@nx/web-shell-feature";
import { provideAppHttp } from "@nx/web-shared-http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppConfigInitializer(),
    provideAppHttp(),
    provideRouter(webShellRoutes),
  ],
};
