import { provideHttpClient } from "@angular/common/http";
import { EnvironmentProviders, Provider } from "@angular/core";
import { provideAppInitWithConfig } from "@nx/web-shared-app-config";
import { HttpService } from "./services/http.service";

export const provideAppHttp = (): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(),
  HttpService,
  provideAppInitWithConfig(HttpService),
];
