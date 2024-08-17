import { effect, inject } from "@angular/core";
import { getState, signalStoreFeature, withHooks } from "@ngrx/signals";
import { LogService } from "./log.service";

export function withLogger<T>(name: keyof T) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        const logService = inject(LogService);
        effect(() => {
          const state = getState(store);
          logService.log(`${name.toString()} state changed`, state);
        });
      },
    })
  );
}
