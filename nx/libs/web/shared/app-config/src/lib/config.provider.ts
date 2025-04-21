import {
  EnvironmentProviders,
  Provider
} from "@angular/core";
import { provideAppConfigInitializer } from "./app-config-initializer.provider";
import { provideAppConfig } from "./app-config.provider";

export function providerConfig(): (EnvironmentProviders | Provider)[] {
  return [provideAppConfigInitializer(), provideAppConfig()];
}
