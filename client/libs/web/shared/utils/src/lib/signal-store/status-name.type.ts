import { Signal } from "@angular/core";

export type Status = "idle" | "pending" | "fulfilled" | { error: unknown };

export type StatusState = {
  status: Status;
};

export type StatusSignals = {
  $isPending: Signal<boolean>;
  $isFulfilled: Signal<boolean>;
  $error: Signal<unknown>;
};

export type NamedStatusState<Prop extends string> = {
  [K in keyof StatusSignals as Prop extends ""
    ? `${Prop}${K}`
    : `${Prop}${Capitalize<K>}`]: StatusSignals[K];
};

export type NamedStatusSignals<Name extends string> = {
  [K in keyof StatusSignals as `$is${Capitalize<Name>}Pending`]: Signal<boolean>;
} & {
  [K in keyof StatusSignals as `$is${Capitalize<Name>}Fulfilled`]: Signal<boolean>;
} & {
  [K in keyof StatusSignals as `$${Name}Error`]: Signal<unknown>;
};
