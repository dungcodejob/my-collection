import { Signal } from "@angular/core";
import { Observable } from "rxjs";
import { ResponseDto } from "../models";

export type ApiCallStatus = "idle" | "pending" | "fulfilled" | { error: unknown };

export type ApiCallState<TData = unknown> = {
  data: TData | null;
  status: ApiCallStatus;
};

export type ApiCallSignals<TData = unknown> = {
  $data: Signal<TData | null>;
  $status: Signal<ApiCallStatus>;
  $isPending: Signal<boolean>;
  $isFulfilled: Signal<boolean>;
  $error: Signal<unknown>;
};

export type NamedApiCallState<Name extends string, TData = unknown> = {
  [K in keyof ApiCallState<TData> as Name extends ""
    ? `${Name}${K}`
    : `${Name}${Capitalize<K>}`]: ApiCallState<TData>[K];
};

export type NamedApiCallSignals<Name extends string, TData = unknown> = {
  [K in keyof ApiCallState<TData> as `$is${Capitalize<Name>}Pending`]: Signal<boolean>;
} & {
  [K in keyof ApiCallState<TData> as `$is${Capitalize<Name>}Fulfilled`]: Signal<boolean>;
} & {
  [K in keyof ApiCallState<TData> as `$${Name}Error`]: Signal<unknown>;
} & {
  [K in keyof ApiCallState<TData> as `$${Name}Data`]: Signal<TData>;
} & {
  [K in keyof ApiCallState<TData> as `$${Name}Status`]: Signal<ApiCallStatus>;
};

export type ApiCallRequestFn<TRequest = unknown, TData = unknown> = (
  request: TRequest
) => Observable<ResponseDto<TData>>;

export type ApiCallTransformFn<TRaw = unknown, TData = unknown> = (
  data: TRaw,
  preData: TData | null
) => TData;

export type ApiCallConfig<TRequest = unknown, TRaw = unknown, TData = unknown> = {
  requestFn: ApiCallRequestFn<TRequest, TRaw>;
  transformFn?: ApiCallTransformFn<TRaw, TData>;
  successFn?: (data: TData) => void;
  errorFn?: (error: unknown) => void;
};

export type NamedApiCallConfig<
  TRequest = unknown,
  TRaw = unknown,
  TData = unknown,
  Name extends string = string,
> = {
  requestFn: ApiCallRequestFn<TRequest, TRaw>;
  transformFn?: ApiCallTransformFn<TRaw, TData>;
  successFn?: (data: TData) => void;
  errorFn?: (error: unknown) => void;
  name: Name;
};
