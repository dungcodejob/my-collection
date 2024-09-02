import { Signal, computed } from "@angular/core";
import { ServerSideError } from "@core/http";
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withState,
} from "@ngrx/signals";
import { capitalize } from "@shared/utils";
import {
  NamedStatusSignals,
  NamedStatusState,
  Status,
  StatusSignals,
  StatusState,
} from "./status-name.type";

function getStatusStateKeys(config?: { name: string }) {
  const name = config?.name;
  return {
    statusKey: name ? `${name}Status` : "status",
    isPendingKey: name ? `$is${capitalize(name)}Pending` : "$isPending",
    isFulfilledKey: name ? `$is${capitalize(name)}Fulfilled` : "$isFulfilled",
    errorKey: name ? `$${name}Error` : "$error",
  };
}

export function withStatus(): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: StatusState;
    computed: StatusSignals;
    methods: {};
  }
>;
export function withStatus<Name extends string>(config: {
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: NamedStatusState<Name>;
    computed: NamedStatusSignals<Name>;
    methods: {};
  }
>;
export function withStatus<Name extends string>(config?: {
  name: Name;
}): SignalStoreFeature {
  const { errorKey, isFulfilledKey, isPendingKey, statusKey } =
    getStatusStateKeys(config);

  return signalStoreFeature(
    withState({ [statusKey]: "idle" }),
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $status = store[statusKey] as Signal<Status>;

      return {
        [isPendingKey]: computed(() => $status() === "pending"),
        [isFulfilledKey]: computed(() => $status() === "fulfilled"),
        [errorKey]: computed(() => {
          const status = $status();
          return typeof status === "object" ? status.error : null;
        }),
      };
    })
  );
}

export function setPending(): StatusState;
export function setPending<Prop extends string>(prop: Prop): NamedStatusState<Prop>;
export function setPending<Prop extends string>(
  prop?: Prop
): StatusState | NamedStatusState<Prop> {
  if (prop) {
    return { [`${prop}Status`]: "pending" } as NamedStatusState<Prop>;
  }

  return { status: "pending" };
}

export function setFulfilled(): StatusState;
export function setFulfilled<Prop extends string>(prop: Prop): NamedStatusState<Prop>;
export function setFulfilled<Prop extends string>(
  prop?: Prop
): StatusState | NamedStatusState<Prop> {
  if (prop) {
    return { [`${prop}Status`]: "fulfilled" } as NamedStatusState<Prop>;
  }
  return { status: "fulfilled" };
}

export function setError(error: ServerSideError): StatusState;
export function setError<Prop extends string>(
  error: ServerSideError,
  prop: Prop
): NamedStatusState<Prop>;
export function setError<Prop extends string>(
  error: ServerSideError,
  prop?: Prop
): StatusState | NamedStatusState<Prop> {
  if (prop) {
    return { [`${prop}Status`]: "fulfilled" } as NamedStatusState<Prop>;
  }
  return { status: { error } };
}
