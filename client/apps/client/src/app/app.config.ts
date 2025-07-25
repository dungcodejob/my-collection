import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withRouterConfig } from "@angular/router";
import { webShellRoutes } from "@client/web-shell-feature";
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
  ],
};
