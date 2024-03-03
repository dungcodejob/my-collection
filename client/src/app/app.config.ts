import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideCore } from "./core";

export const appConfig: ApplicationConfig = {
  providers: [provideCore(), provideRouter(routes)],
};
