import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAppConfigInitializer } from '@nx/web-shared-app-config';
import { webShellRoutes } from '@nx/web-shell-feature';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppConfigInitializer(),
    provideHttpClient(),
    provideRouter(webShellRoutes),
  ],
};
