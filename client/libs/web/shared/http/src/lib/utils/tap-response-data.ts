import { HttpEvent, HttpResponse } from "@angular/common/http";
import { HttpClientResponse } from "../models/http-client-response";
import { ResponseDto, SuccessResponseDto } from "../models/response.dto";
import { Observable, tap } from "rxjs";
import { isPlainObject } from "@nx/web-shared-utils";

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

type UnHttpClientResponse<T> = T extends ResponseDto<infer S>
  ? SuccessResponseDto<S>
  : T extends HttpResponse<ResponseDto<infer D>>
  ? SuccessResponseDto<D>
  : T extends HttpEvent<ResponseDto<infer F>>
  ? SuccessResponseDto<F>
  : never;

export function tapResponseData<T>(
  callback: (data: UnHttpClientResponse<T>["result"]) => void
) {
  return (source$: Observable<T>) =>
    source$.pipe(
      tap(res => {
        if (
          isResponseInstance<UnHttpClientResponse<T>>(
            res as HttpClientResponse<UnHttpClientResponse<T>>
          )
        ) {
          callback((res as HttpResponse<UnHttpClientResponse<T>>).body!.result);
        } else if (
          isPlainResponse<UnHttpClientResponse<T>>(
            res as HttpClientResponse<UnHttpClientResponse<T>>
          )
        ) {
          callback((res as UnHttpClientResponse<T>).result);
        }
      })
    );
}

/**
 * Checks if the emitted value from the HTTP response observable is an instance of `HttpResponse`
 * and contains a successful API response body.
 *
 * This function is specifically designed to handle responses when the `observe` option in `HttpClient`
 * is set to 'response' or 'events', where the response is wrapped in an `HttpEvent` object.
 *
 * @template T The type of the data payload expected in the successful response.
 * @param value The emitted value from the HTTP response observable.
 * @returns `true` if the value is an `HttpResponse` containing a successful response body, otherwise `false`.
 */
function isResponseInstance<T extends SuccessResponseDto<any>>(
  value: HttpClientResponse<T>
): value is HttpResponse<T> {
  return value instanceof HttpResponse && isPlainResponse<T>(value.body!);
}

/**
 * Checks if a value is a plain object and represents a successful API response.
 *
 * This function verifies if the value has the correct structure of an `ApiSuccessResponse`,
 * including the `data` property and a `status` of 'ok'.
 *
 * @template T The type of the data payload expected in the successful response.
 * @param response The value to check.
 * @returns `true` if the value is a plain object representing a successful API response, otherwise `false`.
 */
function isPlainResponse<T extends SuccessResponseDto<any>>(
  response: HttpClientResponse<T>
): response is T {
  return (
    !!response &&
    isPlainObject(response) &&
    "result" in response &&
    response.success === true
  );
}
