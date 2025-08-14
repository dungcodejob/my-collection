import { Observable, tap } from "rxjs";
import { MCApiError } from "../models/error";
import { HttpClientResponse } from "../models/http-client-response";
import { MCResponse, ResponseDto } from "../models/response";

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

export function tapResponseData<T extends HttpClientResponse<ResponseDto<K>>, K>(
  callback: (data: K) => void
) {
  return (source$: Observable<T>): Observable<T> =>
    source$.pipe(
      tap(res => {
        if (MCResponse.isRaw(res)) {
          const response = res.body as ResponseDto<K>;

          if (response.success) {
            callback(response.result);
          } else {
            throw MCApiError.fromResponse(response);
          }
        } else if (MCResponse.is(res)) {
          if (res.success) {
            callback(res.result);
          } else {
            throw MCApiError.fromResponse(res);
          }
        }
      })
    );
}
