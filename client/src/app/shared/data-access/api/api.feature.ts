import { Signal, computed } from "@angular/core";
import { signalStoreFeature, withComputed, withState } from "@ngrx/signals";
import { capitalize } from "@shared/utils";
import { ApiState } from "./api-name.type";

function getApiStateKeys(config?: { name: string }) {
  const name = config?.name;
  return {
    apiKey: name ? `${name}ApiState` : "apiState",
    isPendingKey: name ? `$is${capitalize(name)}Pending` : "$isPending",
    dataKey: name ? `$${capitalize(name)}Data` : "$data",
    errorKey: name ? `$${name}Error` : "$error",
  };
}
export function withApiFeature<Name extends string, T = unknown>(config?: {
  name: Name;
  default: T;
}) {
  const { apiKey, errorKey, isPendingKey, dataKey } = getApiStateKeys(config);
  return signalStoreFeature(
    withState({
      [apiKey]: {
        status: "idle",
        data: config?.default,
      },
    }),
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $apiState = store[apiKey] as Signal<ApiState<T>>;
      return {
        [isPendingKey]: computed(() => $apiState().status === "pending"),
        [dataKey]: computed(() => $apiState().data),
        [errorKey]: computed(() => {
          const status = $apiState().status;
          return typeof status === "object" ? status.error : null;
        }),
      };
    })
  );
}


