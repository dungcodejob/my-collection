import { Signal, computed } from "@angular/core";
import {
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withState,
} from "@ngrx/signals";
import { EmptyFeatureResult } from "@ngrx/signals/src/signal-store-models";
import { ApiSignals, ApiState, NamedApiSignals, NamedApiState } from "./api-name.type";

function getApiStateKeys(config?: { name?: string }) {
  const name = config?.name;
  return {
    apiKey: name ? `${name}ApiState` : "apiState",
    loadingKey: name ? `$${name}Loading` : "$loading",
    dataKey: name ? `$${name}Data` : "$data",
    errorKey: name ? `$${name}Error` : "$error",
  };
}

export function withApiFeature<TData>(): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: ApiState<TData>;
    signals: ApiSignals<TData>;
    methods: {};
  }
>;
export function withApiFeature<TData>(config: { type: TData }): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: ApiState<TData>;
    signals: ApiSignals<TData>;
    methods: {};
  }
>;
export function withApiFeature<TData, Name extends string>(config: {
  type: TData;
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: NamedApiState<TData, Name>;
    signals: NamedApiSignals<TData, Name>;
    methods: {};
  }
>;
export function withApiFeature<TData>(config: {
  type: TData;
  default: TData;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: ApiState<TData>;
    signals: ApiSignals<TData>;
    methods: {};
  }
>;
export function withApiFeature<TData, Name extends string>(config: {
  type: TData;
  default: TData;
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: NamedApiState<TData, Name>;
    signals: NamedApiSignals<TData, Name>;
    methods: {};
  }
>;
export function withApiFeature<TData, Name extends string>(config?: {
  type: TData;
  default?: TData;
  name?: Name;
}) {
  const { apiKey, errorKey, loadingKey, dataKey } = getApiStateKeys(config);
  console.log(apiKey, errorKey, loadingKey, dataKey);
  return signalStoreFeature(
    withState({
      [apiKey]: {
        status: "idle",
        data: config ? config.default : null,
      },
    }),
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $apiState = store[apiKey] as Signal<ApiState<TData>>;
      return {
        [loadingKey]: computed(() => $apiState().status === "pending"),
        [dataKey]: computed(() => $apiState().data),
        [errorKey]: computed(() => {
          const status = $apiState().status;
          return typeof status === "object" ? status.error : null;
        }),
      };
    })
  );
}
