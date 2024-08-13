import { Signal } from "@angular/core";
import { ServerSideError } from "@core/http";
import { Status } from "../status/status-name.type";

export type ApiState<T = unknown> = {
  status: Status;
  data: T;
};

export type ApiSignals<T = unknown> = {
  $pending: Signal<boolean>;
  $data: Signal<T>;
  $error: Signal<ServerSideError | null>;
};

export type NamedApiState<Name extends string> = {
  [K in Name as `${K}ApiState`]: ApiState;
};

export type NamedApiSignals<Name extends string, T = unknown> = {
  [K in Name as `$${K}Pending`]: Signal<boolean>;
} & {
  [K in Name as `$${K}Data`]: Signal<T>;
} & {
  [K in Name as `$${K}Error`]: Signal<ServerSideError | null>;
};
