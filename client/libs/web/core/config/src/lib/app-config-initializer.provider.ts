import { inject, provideAppInitializer } from "@angular/core";
import { exhaustMap, mergeAll, tap } from "rxjs";
import { AppConfigService, MCConfig } from "./app-config.service";
import { APP_INIT_WITH_CONFIG_ASYNC } from "./app-init-with-config-async.provider";
import { APP_INIT_WITH_CONFIG } from "./app-init-with-config.provider";

export function provideAppConfigInitializer(
  defaultConfig: MCConfig
): ReturnType<typeof provideAppInitializer> {
  return provideAppInitializer(() => {
    const configService = inject(AppConfigService);
    const services = inject(APP_INIT_WITH_CONFIG, { optional: true }) || [];
    const initializeFns = inject(APP_INIT_WITH_CONFIG_ASYNC, { optional: true }) || [];

    return configService.load(defaultConfig).pipe(
      tap(config => {
        for (const service of services) {
          service.configure(config);
        }
      }),
      exhaustMap(config => initializeFns.map(initializeFn => initializeFn(config))),
      mergeAll()
    );
  });
}
