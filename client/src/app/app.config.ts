import { ApplicationConfig } from "@angular/core";
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from "@angular/router";

import { provideBookmark } from "@bookmark/data-access";
import { provideCollection } from "@collection/data-access";
import { provideTag } from "@shared/data-access";
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
    provideBookmark(),
    provideTag(),
    provideCollection(),
  ],
};
