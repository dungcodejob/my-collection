import { HttpResponse } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { MCResponse, ResponseDto } from "../models";
import { MCApiError } from "../models/error";

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

export function tapResponseData<T extends ResponseDto<K>, K>(
  callback: (data: K) => void
): (source$: Observable<T>) => Observable<T>;
export function tapResponseData<T extends HttpResponse<ResponseDto<K>>, K>(
  callback: (data: K) => void,
  options: {
    isRaw: true;
  }
): (source$: Observable<T>) => Observable<T>;
export function tapResponseData<
  T extends HttpResponse<ResponseDto<K>> | ResponseDto<K>,
  K,
>(
  callback: (data: K) => void,
  options?: {
    isRaw: true;
  }
): (source$: Observable<T>) => Observable<T> {
  return (source$: Observable<T>): Observable<T> =>
    source$.pipe(
      tap(res => {
        let response: ResponseDto<K>;
        if (options?.isRaw) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          response = (res as HttpResponse<ResponseDto<K>>).body!;
        } else {
          response = res as ResponseDto<K>;
        }

        if (MCResponse.is(response)) {
          if (response.success) {
            callback(response.result);
          } else {
            throw MCApiError.fromResponse(response);
          }
        }

        // Fallback case - should not happen with proper typing
        throw new Error("Unsupported response type");
      })
    );
}
