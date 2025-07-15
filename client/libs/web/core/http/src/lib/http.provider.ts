import { provideHttpClient } from "@angular/common/http";
import { EnvironmentProviders, Provider } from "@angular/core";

export const provideAppHttp = (): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(),
  // HttpService,
  // provideAppInitWithConfig(HttpService),
];
