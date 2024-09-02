import { computed, Signal } from "@angular/core";
import { ResponseDto } from "@core/http";
import {
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { EmptyFeatureResult } from "@ngrx/signals/src/signal-store-models";
import { catchError, map, Observable, of, startWith } from "rxjs";
import {
  ApiMethods,
  ApiSignals,
  ApiState,
  NamedApiMethods,
  NamedApiSignals,
  NamedApiState,
} from "./api-name.type";

function getApiStateKeys(config?: { name?: string }) {
  const name = config?.name;
  return {
    apiKey: name ? `${name}ApiState` : "apiState",
    loadingKey: name ? `$${name}Loading` : "$loading",
    dataKey: name ? `$${name}Data` : "$data",
    errorKey: name ? `$${name}Error` : "$error",
    handleKey: name ? `$${name}ApiHandle` : "$apiHandle",
  };
}

export function withApiFeature<TData>(): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: ApiState<TData>;
    computed: ApiSignals<TData>;
    methods: {};
  }
>;
export function withApiFeature<TData>(config: { type: TData }): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: ApiState<TData>;
    computed: ApiSignals<TData>;
    methods: ApiMethods<TData>;
  }
>;
export function withApiFeature<TData, Name extends string>(config: {
  type: TData;
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: NamedApiState<TData, Name>;
    computed: NamedApiSignals<TData, Name>;
    methods: NamedApiMethods<TData, Name>;
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
    methods: ApiMethods<TData>;
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
    methods: NamedApiMethods<TData, Name>;
  }
>;
export function withApiFeature<TData, Name extends string>(config?: {
  type: TData;
  default?: TData;
  name?: Name;
}) {
  const { apiKey, errorKey, loadingKey, dataKey, handleKey } = getApiStateKeys(config);
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
    }),
    withMethods(() => {
      return {
        [handleKey]: <R extends ResponseDto<TData>>(
          source$: Observable<R>
        ): Observable<ApiState<TData>> => {
          return source$.pipe(
            map(
              res =>
                ({
                  status: "fulfilled",
                  data: res.result,
                }) as ApiState<TData>
            ),
            startWith({
              status: "pending",
              data: config ? config.default : null,
            } as ApiState<TData>),
            catchError(error =>
              of({
                status: { error },
                data: config ? config.default : null,
              } as ApiState<TData>)
            )
          );
        },
      };
    })
  );
}
