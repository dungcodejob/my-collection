import { HttpEvent, HttpResponse } from "@angular/common/http";
import { MonoTypeOperatorFunction, Observable, tap } from "rxjs";
import { HttpClientResponse } from "../models/http-client-response";
import { MCApiResponse, ResponseDto, SuccessResponseDto } from "../models/response.dto";

/**
 * A custom RxJS operator that taps into an HTTP response observable to extract the data payload.
 * It handles different response types ('body', 'response', 'events') and ensures a successful response format.
 *
 * @template T The type of the data payload expected in the successful response.
 * @param callback A function that is called with the extracted data payload when a successful response is received.
 * @returns An RxJS operator function that can be applied to an observable of HttpEvent<ApiSuccessResponse<T>>, ApiSuccessResponse<T>, or T.
 */
// export function tapResponseData<T>(
//   callback: (data: SuccessResponseDto<T>["result"]) => void
// ) {
//   return tap((res: HttpClientResponse<ResponseDto<T>>) => {
//     if (isResponseInstance<T>(res)) {
//       callback((res as HttpResponse<SuccessResponseDto<T>>).body!.result);
//     }
//   });
// }

type UnHttpClientResponse<T> =
  T extends ResponseDto<infer S>
    ? SuccessResponseDto<S>
    : T extends HttpResponse<ResponseDto<infer D>>
      ? SuccessResponseDto<D>
      : T extends HttpEvent<ResponseDto<infer F>>
        ? SuccessResponseDto<F>
        : never;

export function tapResponseData<T extends SuccessResponseDto<K>, K>(
  callback: (data: K) => void
): MonoTypeOperatorFunction<T>;
export function tapResponseData<T extends HttpResponse<SuccessResponseDto<K>>, K>(
  callback: (data: K) => void
): MonoTypeOperatorFunction<T>;
export function tapResponseData<T extends HttpEvent<SuccessResponseDto<K>>, K>(
  callback: (data: K) => void
): MonoTypeOperatorFunction<T>;
export function tapResponseData<T extends HttpClientResponse<SuccessResponseDto<K>>, K>(
  callback: (data: K) => void
): MonoTypeOperatorFunction<T> {
  return (source$: Observable<T>): Observable<T> =>
    source$.pipe(
      tap(res => {
        if (MCApiResponse.isRaw<SuccessResponseDto<K>>(res)) {
          callback((res).body!.result);
        } else if (MCApiResponse.is<SuccessResponseDto<K>>(res)) {
          callback((res).result);
        }
      })
    );
}
