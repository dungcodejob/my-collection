import { Signal } from "@angular/core";
import { ServerSideError } from "@core/http";
import { Status } from "../status/status-name.type";

export type ApiState<T> = {
  status: Status;
  data: T;
};

export type ApiSignals<T> = {
  $loading: Signal<boolean>;
  $data: Signal<T>;
  $error: Signal<ServerSideError | null>;
};

export type NamedApiState<T, Name extends string> = {
  [K in Name as `${K}ApiState`]: ApiState<T>;
};

export type NamedApiSignals<T, Name extends string> = {
  [K in Name as `$${K}Loading`]: Signal<boolean>;
} & {
  [K in Name as `$${K}Data`]: Signal<T>;
} & {
  [K in Name as `$${K}Error`]: Signal<ServerSideError | null>;
};
