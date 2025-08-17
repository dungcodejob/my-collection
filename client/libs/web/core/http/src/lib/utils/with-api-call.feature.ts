import { Signal, computed } from "@angular/core";
import { capitalize } from "@client/web-shared-utils";
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { switchMap } from "rxjs";
import { tapError } from "./tap-error";
import { tapResponseData } from "./tap-response-data";
import {
  ApiCallConfig,
  ApiCallSignals,
  ApiCallState,
  ApiCallStatus,
  NamedApiCallConfig,
  NamedApiCallSignals,
  NamedApiCallState,
} from "./with-api-call-name.type";

// Helper function to get state and signal keys
function getApiCallKeys(name?: string): {
  dataKey: string;
  statusKey: string;
  isPendingKey: string;
  isFulfilledKey: string;
  errorKey: string;
  callMethodKey: string;
} {
  return {
    dataKey: name ? `${name}Data` : "data",
    statusKey: name ? `${name}Status` : "status",
    isPendingKey: name ? `$is${capitalize(name)}Pending` : "$isPending",
    isFulfilledKey: name ? `$is${capitalize(name)}Fulfilled` : "$isFulfilled",
    errorKey: name ? `$${name}Error` : "$error",
    callMethodKey: name ? `call${capitalize(name)}` : "call",
  };
}

// Overload for unnamed API call
export function withApiCall<TRequest = unknown, TRaw = unknown, TData = TRaw>(
  config: ApiCallConfig<TRequest, TRaw, TData>
): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: ApiCallState<TData>;
    props: ApiCallSignals<TData> & {
      call: (request: TRequest) => void;
    };
  }
>;

// Overload for named API call
export function withApiCall<
  TRequest = unknown,
  TRaw = unknown,
  TData = TRaw,
  Name extends string = string,
>(
  config: NamedApiCallConfig<TRequest, TRaw, TData, Name>
): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: NamedApiCallState<TData, Name>;
    props: NamedApiCallSignals<TData, Name> & {
      [K in `call${Capitalize<Name>}`]: (request: TRequest) => void;
    };
  }
>;

// Implementation
export function withApiCall<
  TRequest = unknown,
  TRaw = unknown,
  TData = TRaw,
  Name extends string = string,
>(
  config:
    | ApiCallConfig<TRequest, TRaw, TData>
    | NamedApiCallConfig<TRequest, TRaw, TData, Name>
): SignalStoreFeature {
  const { requestFn, transformFn, name } = config as NamedApiCallConfig<
    TRequest,
    TRaw,
    TData,
    Name
  >;
  const keys = getApiCallKeys(name);

  return signalStoreFeature(
    // Initialize state
    withState(() => ({
      [keys.dataKey]: null as TData,
      [keys.statusKey]: "idle" as ApiCallStatus,
    })),

    // Add computed signals
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $status = store[keys.statusKey] as Signal<ApiCallStatus>;
      const $data = store[keys.dataKey] as Signal<TData | null>;

      return {
        [keys.dataKey]: $data,
        [keys.statusKey]: $status,
        [keys.isPendingKey]: computed(() => $status() === "pending"),
        [keys.isFulfilledKey]: computed(() => $status() === "fulfilled"),
        [keys.errorKey]: computed(() => {
          const status = $status();
          return typeof status === "object" ? status.error : null;
        }),
      };
    }),

    // Add methods
    withMethods(store => {
      const callMethod = rxMethod<TRequest>(
        switchMap((request: TRequest) => {
          // Set pending state
          patchState(store, {
            [keys.statusKey]: "pending",
          });

          return requestFn(request).pipe(
            tapResponseData(data => {
              const $preData = store[keys.dataKey] as Signal<TData | null>;
              const transformedData = transformFn ? transformFn(data, $preData()) : data;
              patchState(store, {
                [keys.dataKey]: transformedData as TData,
              });
            }),
            tapError(error => {
              patchState(store, {
                [keys.statusKey]: { error },
              });
            })
          );
        })
      );

      return {
        [keys.callMethodKey]: callMethod,
      };
    })
  );
}

// Helper functions for setting states manually
export function setApiCallPending<TData = unknown>(
  name?: string
): Partial<ApiCallState<TData>> {
  const keys = getApiCallKeys(name);
  return {
    [keys.statusKey]: "pending",
  } as Partial<ApiCallState<TData>>;
}

export function setApiCallFulfilled<TData = unknown>(
  data: TData,
  name?: string
): Partial<ApiCallState<TData>> {
  const keys = getApiCallKeys(name);
  return {
    [keys.dataKey]: data,
    [keys.statusKey]: "fulfilled",
  } as Partial<ApiCallState<TData>>;
}

export function setApiCallError<TData = unknown>(
  error: unknown,
  name?: string
): Partial<ApiCallState<TData>> {
  const keys = getApiCallKeys(name);
  return {
    [keys.statusKey]: { error },
  } as Partial<ApiCallState<TData>>;
}

export function setApiCallIdle<TData = unknown>(
  name?: string
): Partial<ApiCallState<TData>> {
  const keys = getApiCallKeys(name);
  return {
    [keys.statusKey]: "idle",
  } as Partial<ApiCallState<TData>>;
}
