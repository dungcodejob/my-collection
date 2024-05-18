import { EnvironmentProviders, Provider } from "@angular/core";

import { provideAuth } from "./auth";
import { provideConfigInitializer } from "./config";
import { provideHttp } from "./http/http.provider";
import { provideI18n } from "./i18n";

export const provideCore = (): (Provider | EnvironmentProviders)[] => [
  provideConfigInitializer(),
  provideHttp(),
  provideAuth(),
  provideI18n(),
];
