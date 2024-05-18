import { InjectionToken, Provider, Type } from "@angular/core";
import { EnvConfig } from "./env-config";

export interface OnInitConfig {
  configure(config: EnvConfig): void;
}

export const APP_INIT_WITH_CONFIG = new InjectionToken<Readonly<OnInitConfig[]>>(
  "APP_INI_WITH_CONFIG"
);

type ProviderFn = <T extends OnInitConfig>(impl: Type<T>) => Provider;
export const provideAppInitWithConfig: ProviderFn = <T extends OnInitConfig>(
  impl: Type<T>
): Provider => ({
  provide: APP_INIT_WITH_CONFIG,
  multi: true,
  useExisting: impl,
});
