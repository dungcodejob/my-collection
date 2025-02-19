import {
  EnvironmentProviders,
  FactoryProvider,
  InjectionToken,
  Provider,
  inject,
  provideAppInitializer,
} from "@angular/core";
import { AppConfigService } from "./services/app-config.service";
import { tap, exhaustMap, mergeAll } from "rxjs";
import { APP_INIT_WITH_CONFIG_ASYNC } from "./app-init-with-config-async.provider";
import { APP_INIT_WITH_CONFIG } from "./app-init-with-config.provider";
import { AuthStore } from "@nx/web-auth-data-access";
import { AppConfig } from "./models/app-config";
import { provideAppConfigInitializer } from "./app-config-initializer.provider";
import { provideAppConfig } from "./app-config.provider";

export function providerConfig(): (EnvironmentProviders | Provider)[] {
  return [provideAppConfigInitializer(), provideAppConfig()];
}
