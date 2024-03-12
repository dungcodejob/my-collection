import { InjectionToken, Provider } from "@angular/core";
import { Observable } from "rxjs";
import { EnvConfig } from "./env-config";

type FactoryFn = (config: EnvConfig) => Observable<unknown>;

export const APP_INIT_WITH_CONFIG_ASYNC = new InjectionToken<Readonly<FactoryFn[]>>(
  "APP_INIT_WITH_CONFIG_ASYNC"
);

type ProviderFn = (fn: FactoryFn) => Provider;
export const provideAppInitWithConfigAsync: ProviderFn = (fn: FactoryFn): Provider => ({
  provide: APP_INIT_WITH_CONFIG_ASYNC,
  multi: true,
  useFactory: fn,
});
