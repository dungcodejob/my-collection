import { Signal } from "@angular/core";
import { ServerSideError } from "@core/http";
import { SignalsDictionary } from "@ngrx/signals/src/signal-store-models";

export type Status = "idle" | "pending" | "fulfilled" | { error: ServerSideError };

export interface StatusState {
  status: Status;
}

export interface StatusSignals extends SignalsDictionary {
  $isPending: Signal<boolean>;
  $isFulfilled: Signal<boolean>;
  $error: Signal<ServerSideError | null>;
}

export type NamedStatusState<Name extends string> = {
  [K in keyof StatusState as `${Name}${Capitalize<K>}`]: Status;
};

export type NamedStatusSignals<Name extends string> = {
  [K in keyof StatusSignals as `$is${Capitalize<Name>}Pending`]: Signal<boolean>;
} & {
  [K in keyof StatusSignals as `$is${Capitalize<Name>}Fulfilled`]: Signal<boolean>;
} & {
  [K in keyof StatusSignals as `$${Name}Error`]: Signal<ServerSideError | null>;
};
