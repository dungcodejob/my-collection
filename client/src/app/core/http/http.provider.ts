import { provideHttpClient } from "@angular/common/http";
import { EnvironmentProviders, Provider } from "@angular/core";
import { provideAppInitWithConfig } from "@core/config";
import { HttpService } from "./http.service";

export const provideHttp = (): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(),
  HttpService,
  provideAppInitWithConfig(HttpService),
];
