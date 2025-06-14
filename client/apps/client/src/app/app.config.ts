import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { THEME_DARK_MODE_CLASS } from "@client/web-shared-services";
import Aura from "@primeng/themes/aura";
import { providePrimeNG } from "primeng/config";
import { appRoutes } from "./app.routes";
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
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
