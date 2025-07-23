import { HttpEvent, HttpResponse } from "@angular/common/http";
import { EventInstance } from "@ngrx/signals/events";
import { OperatorFunction } from "rxjs";
import { HttpClientResponse } from "../models/http-client-response";
import { SuccessResponseDto } from "../models/response.dto";
import { mapToErrorAction } from "./map-to-error-action";
import { mapToSuccessAction } from "./map-to-success-action";
export function mapHttpResponse<TData, TPayload, TErrorPayload = unknown>(
  successActionCreator: (payload?: TData) => EventInstance<string, TPayload>,
  errorActionCreator: (payload: TErrorPayload) => EventInstance<string, TErrorPayload>,
  callback?: (data: TData) => void
): OperatorFunction<SuccessResponseDto<TData>, EventInstance<string, TPayload> | EventInstance<string, TErrorPayload>>
export function mapHttpResponse<TData, TPayload, TErrorPayload = unknown>(
  successActionCreator: (payload?: TData) => EventInstance<string, TPayload>,
  errorActionCreator: (payload: TErrorPayload) => EventInstance<string, TErrorPayload>,
  callback?: (data: TData) => void
): OperatorFunction<HttpEvent<SuccessResponseDto<TData>>, EventInstance<string, TPayload> | EventInstance<string, TErrorPayload>>
export function mapHttpResponse<TData, TPayload, TErrorPayload = unknown>(
  successActionCreator: (payload?: TData) => EventInstance<string, TPayload>,
  errorActionCreator: (payload: TErrorPayload) => EventInstance<string, TErrorPayload>,
  callback?: (data: TData) => void
): OperatorFunction<HttpResponse<SuccessResponseDto<TData>>, EventInstance<string, TPayload> | EventInstance<string, TErrorPayload>>
export function mapHttpResponse<TData, TPayload, TErrorPayload = unknown>(
  successActionCreator: (payload?: TData) => EventInstance<string, TPayload>,
  errorActionCreator: (payload: TErrorPayload) => EventInstance<string, TErrorPayload>,
  callback?: (data: TData) => void
): OperatorFunction<HttpClientResponse<SuccessResponseDto<TData>>, EventInstance<string, TPayload> | EventInstance<string, TErrorPayload>> {
  return (source$) => {
    return source$.pipe(
      mapToSuccessAction<TData, TPayload>(successActionCreator, callback) as OperatorFunction<HttpClientResponse<SuccessResponseDto<TData>>, EventInstance<string, TPayload>>,
      mapToErrorAction(errorActionCreator)
    );
  };
}