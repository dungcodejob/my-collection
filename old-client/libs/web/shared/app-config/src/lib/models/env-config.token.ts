import { inject, InjectionToken } from "@angular/core";
import { EnvConfig } from "./env-config";

export const ENV_CONFIG = new InjectionToken<EnvConfig>("my-collection.config");

export const provideEnvConfig = (config: EnvConfig) => ({
  provide: ENV_CONFIG,
  useValue: config,
});

export const injectEnvConfig = () => inject(ENV_CONFIG);
