import { Signal } from "@angular/core";
import { ResponseDto, ServerSideError } from "@core/http";
import {
  MethodsDictionary,
  SignalsDictionary,
} from "@ngrx/signals/src/signal-store-models";
import { Observable } from "rxjs";
import { Status } from "../status/status-name.type";

export interface ApiState<T> {
  status: Status;
  data: T;
}

export interface ApiSignals<T> extends SignalsDictionary {
  $loading: Signal<boolean>;
  $data: Signal<T>;
  $error: Signal<ServerSideError | null>;
}

export interface ApiMethods<TData> extends MethodsDictionary {
  $apiHandle: <R extends ResponseDto<TData>>(
    source$: Observable<R>
  ) => Observable<ApiState<TData>>;
}

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

export type NamedApiMethods<TData, ActionName extends string> = {
  [K in ActionName as `$${K}apiHandle`]: <R extends ResponseDto<TData>>(
    source$: Observable<R>
  ) => Observable<ApiState<TData>>;
};
