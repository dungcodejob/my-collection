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

export type NamedApiCallState<TData = unknown, Name extends string = string> = {
  [K in keyof ApiCallState<TData> as Name extends ""
    ? `${K}`
    : `${Name}${Capitalize<string & K>}`]: ApiCallState<TData>[K];
};

export type NamedApiCallSignals<TData = unknown, Name extends string = string> = {
  [K in keyof ApiCallSignals<TData> as Name extends ""
    ? `${K}`
    : K extends `$${infer Rest}`
      ? `$${Name}${Capitalize<Rest>}`
      : `${Name}${Capitalize<string & K>}`]: ApiCallSignals<TData>[K];
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
  name?: string;
};

export type NamedApiCallConfig<
  TRequest = unknown,
  TRaw = unknown,
  TData = unknown,
  Name extends string = string,
> = {
  requestFn: ApiCallRequestFn<TRequest, TRaw>;
  transformFn?: ApiCallTransformFn<TRaw, TData>;
  name: Name;
};
