import { Signal } from "@angular/core";
import { ServerSideError } from "@core/http";

export type Status = "idle" | "pending" | "fulfilled" | { error: ServerSideError };

export type StatusState = {
  status: Status;
}

export type StatusSignals = {
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
