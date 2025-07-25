import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  Provider,
  Signal,
} from "@angular/core";
import { provideAppConfigInitializer } from "./app-config-initializer.provider";
import { AppConfigService, MCConfig } from "./app-config.service";

const APP_CONFIG = new InjectionToken<Signal<MCConfig>>("my-collection.app-config");

export const injectAppConfig = (): Signal<MCConfig> => inject(APP_CONFIG);

export function providerAppConfig(
  defaultConfig: MCConfig
): (EnvironmentProviders | Provider)[] {
  return [
    provideAppConfigInitializer(defaultConfig),
    {
      provide: APP_CONFIG,
      useFactory: (): Signal<MCConfig> => {
        const configService = inject(AppConfigService);
        return configService.config;
      },
    },
  ];
}
