import {
  HttpFeature,
  HttpFeatureKind,
  provideHttpClient,
  withFetch,
} from "@angular/common/http";
import { EnvironmentProviders, Provider } from "@angular/core";
import { provideAppInitWithConfig } from "@client/web-core-config";
import { HttpService } from "./services/http.service";

export const provideAppHttp = (
  ...features: HttpFeature<HttpFeatureKind>[]
): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(...features),
  provideHttpClient(withFetch()),
  provideAppInitWithConfig(HttpService),
];
