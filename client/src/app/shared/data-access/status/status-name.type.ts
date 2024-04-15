import { Signal } from "@angular/core";
import { ServerSideError } from "@core/http";
import { MethodsDictionary } from "@ngrx/signals/src/signal-store-models";

export type Status = "idle" | "pending" | "fulfilled" | { error: ServerSideError };

export type StatusState = {
  status: Status;
};

export type StatusSignals = {
  $isPending: Signal<boolean>;
  $isFulfilled: Signal<boolean>;
  $error: Signal<ServerSideError | null>;
};

export type StatusMethods = MethodsDictionary;

export type NamedStatusState<Name extends string> = {
  [K in Name as `${K}Status`]: Status;
};

export type NamedStatusSignals<Name extends string> = {
  [K in Name as `$is${Capitalize<K>}Pending`]: Signal<boolean>;
} & {
  [K in Name as `$is${Capitalize<K>}Fulfilled`]: Signal<boolean>;
} & {
  [K in Name as `$${K}Error`]: Signal<ServerSideError | null>;
};

export type NamedStatusMethods = MethodsDictionary;
