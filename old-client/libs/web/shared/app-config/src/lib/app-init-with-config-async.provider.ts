import { InjectionToken, Provider } from "@angular/core";
import { Observable } from "rxjs";
import { AppConfig } from "./models/app-config";

type FactoryFn = () => (config: AppConfig) => Observable<unknown>;

export const APP_INIT_WITH_CONFIG_ASYNC = new InjectionToken<
  readonly ReturnType<FactoryFn>[]
>("APP_INIT_WITH_CONFIG_ASYNC");

type ProviderFn = (fn: FactoryFn) => Provider;
export const provideAppInitWithConfigAsync: ProviderFn = (fn: FactoryFn): Provider => ({
  provide: APP_INIT_WITH_CONFIG_ASYNC,
  multi: true,
  useFactory: fn,
});
