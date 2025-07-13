import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withRouterConfig } from "@angular/router";
import { THEME_DARK_MODE_CLASS } from "@client/web-shared-services";
import { webShellRoutes } from "@client/web-shell-feature";
import Aura from "@primeng/themes/aura";
import { providePrimeNG } from "primeng/config";

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
    providePrimeNG({
      theme: {
        preset: Aura,

        options: {
          darkModeSelector: THEME_DARK_MODE_CLASS,
          cssLayer: {
            name: "primeng",
            order: "theme, base, primeng",
          },
        },
      },
    }),
  ],
};
