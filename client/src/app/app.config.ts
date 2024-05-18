import { ApplicationConfig } from "@angular/core";
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from "@angular/router";

import { routes } from "./app.routes";
import { provideCore } from "./core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: "always" })
    ),
  ],
};
