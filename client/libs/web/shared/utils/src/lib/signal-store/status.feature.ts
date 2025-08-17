import { Signal, computed } from "@angular/core";

import {
  EmptyFeatureResult,
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withState,
} from "@ngrx/signals";

import { capitalize } from "../string.utils";
import {
  NamedStatusSignals,
  NamedStatusState,
  Status,
  StatusSignals,
  StatusState,
} from "./status-name.type";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getStatusStateKeys(config?: { name: string }) {
  const name = config?.name;
  return {
    statusKey: name ? `${name}Status` : "status",
    isPendingKey: name ? `$is${capitalize(name)}Pending` : "$isPending",
    isFulfilledKey: name ? `$is${capitalize(name)}Fulfilled` : "$isFulfilled",
    errorKey: name ? `$${name}Error` : "$error",
  };
}

function getNamesArray(
  config: { name?: string } | { names?: string[] }
): string[] | undefined {
  return "names" in config
    ? config.names
    : "name" in config && config.name
      ? [config.name]
      : undefined;
}

export function withStatus(): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: StatusState;
    props: StatusSignals;
  }
>;
export function withStatus<Name extends string>(config: {
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: NamedStatusState<Name>;
    props: NamedStatusSignals<Name>;
  }
>;
export function withStatus<Name extends string>(config: {
  names: Name[];
}): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: NamedStatusState<Name>;
    props: NamedStatusSignals<Name>;
  }
>;
export function withStatus<Name extends string>(
  config?:
    | {
        name: Name;
      }
    | {
        names: Name[];
      }
): SignalStoreFeature {
  return signalStoreFeature(
    withState(() => {
      if (!config) {
        return { status: "idle" };
      }
      const names = getNamesArray(config);
      if (names) {
        return names.reduce(
          (acc, cur) => ({
            ...acc,
            ...{ [cur ? `${cur}Status` : "status"]: "idle" },
          }),
          {}
        );
      }

      return { status: "idle" };
    }),
    withComputed((store: Record<string, Signal<unknown>>) => {
      if (config) {
        const names = getNamesArray(config);
        if (names) {
          return names.reduce<Record<string, Signal<unknown>>>((acc, cur: string) => {
            const { errorKey, isFulfilledKey, isPendingKey, statusKey } =
              getStatusStateKeys({ name: cur });
            const $status = store[statusKey] as Signal<Status>;
            return {
              ...acc,
              [isPendingKey]: computed(() => $status() === "pending"),
              [isFulfilledKey]: computed(() => $status() === "fulfilled"),
              [errorKey]: computed(() => {
                const status = $status();
                return typeof status === "object" ? status.error : null;
              }),
            };
          }, {});
        }
      }
      const { errorKey, isFulfilledKey, isPendingKey, statusKey } = getStatusStateKeys();
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
    return { [`${prop}Status`]: "pending" } as unknown as NamedStatusState<Prop>;
  }

  return { status: "pending" };
}

export function setFulfilled(): StatusState;
export function setFulfilled<Prop extends string>(prop: Prop): NamedStatusState<Prop>;
export function setFulfilled<Prop extends string>(
  prop?: Prop
): StatusState | NamedStatusState<Prop> {
  if (prop) {
    return { [`${prop}Status`]: "fulfilled" } as unknown as NamedStatusState<Prop>;
  }
  return { status: "fulfilled" };
}

export function setError(error: unknown): StatusState;
export function setError<Prop extends string>(
  error: unknown,
  prop: Prop
): NamedStatusState<Prop>;
export function setError<Prop extends string>(
  error: unknown,
  prop?: Prop
): StatusState | NamedStatusState<Prop> {
  if (prop) {
    return { [`${prop}Status`]: { error } } as unknown as NamedStatusState<Prop>;
  }
  return { status: { error } };
}
export function setStatus(status: Status): StatusState;
export function setStatus<Prop extends string>(
  status: Status,
  prop: Prop
): NamedStatusState<Prop>;
export function setStatus<Prop extends string>(
  status: Status,
  prop?: Prop
): StatusState | NamedStatusState<Prop> {
  console.log("setStatus", status, prop);
  if (prop) {
    return { [`${prop}Status`]: status } as NamedStatusState<Prop>;
  }
  return { status };
}
