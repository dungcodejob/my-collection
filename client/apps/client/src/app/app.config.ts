import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withRouterConfig } from "@angular/router";
import { providerAppConfig } from "@client/web-core-config";
import { provideAppHttp } from "@client/web-core-http";
import { webShellRoutes } from "@client/web-shell-feature";
import { environment } from "./environments/environment";
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // provideAppInitializer(() => {
    //   const themeService = inject(ThemeService);
    //   themeService.setThemePreset(ThemePreset.Aura);
    // }),
    provideRouter(
      webShellRoutes,
      withRouterConfig({ defaultQueryParamsHandling: "preserve" })
    ),
    provideAnimationsAsync(),
    providerAppConfig(environment),
    provideAppHttp(),
  ],
};
