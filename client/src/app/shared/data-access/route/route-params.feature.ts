import { computed } from "@angular/core";
import { signalStoreFeature, withComputed } from "@ngrx/signals";
import { injectParams } from "@shared/utils";
import { ParamsComputed, ParamsConfig } from "./param";

export function withRouteParams<Config extends ParamsConfig>(config: Config) {
  return signalStoreFeature(
    withComputed(() => {
      const routeParams = injectParams();

      return Object.keys(config).reduce(
        (acc, key) => ({
          ...acc,
          [key]: computed(() => {
            const value = routeParams()[key];
            return config[key](value);
          }),
        }),
        {} as ParamsComputed<Config>
      );
    })
  );
}
