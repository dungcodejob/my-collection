import { provideHttpClient } from "@angular/common/http";
import { EnvironmentProviders, Provider } from "@angular/core";
import { provideConfigInitializer } from "./config";
import { provideI18n } from "./i18n";

export const provideCore = (): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(),
  provideConfigInitializer(),
  provideI18n(),
];
