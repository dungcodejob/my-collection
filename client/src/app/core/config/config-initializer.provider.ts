import { APP_INITIALIZER, Provider, inject } from "@angular/core";
import { exhaustMap, mergeAll, tap } from "rxjs";
import { APP_INIT_WITH_CONFIG_ASYNC } from "./app-init-with-config-async.provider";
import { APP_INIT_WITH_CONFIG } from "./app-init-with-config.provider";
import { ConfigService } from "./config.service";

export function provideConfigInitializer(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => {
      const configService = inject(ConfigService);
      const services = inject(APP_INIT_WITH_CONFIG, { optional: true }) || [];
      const initializeFns = inject(APP_INIT_WITH_CONFIG_ASYNC, { optional: true }) || [];

      return () =>
        configService.load().pipe(
          tap(config => {
            for (const service of services) {
              service.configure(config);
            }
          }),
          exhaustMap(config => initializeFns.map(initializeFn => initializeFn(config))),
          mergeAll()
        );
    },
  };
}
