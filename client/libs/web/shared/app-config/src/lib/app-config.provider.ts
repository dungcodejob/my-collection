import { InjectionToken, FactoryProvider, inject } from "@angular/core";
import { AppConfig } from "./models/app-config";
import { AppConfigService } from "./services/app-config.service";


const APP_CONFIG = new InjectionToken<AppConfig>("my-collection.app-config");

export const provideAppConfig = (): FactoryProvider => ({
  provide: APP_CONFIG,
  useFactory: () => {
    const appConfigService = inject(AppConfigService);
    return appConfigService.config;
  },
});

export const injectAppConfig = () => inject(APP_CONFIG);