import { HttpResponse } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { ErrorResponseDto, MCResponse, ResponseDto, UnwrapResponseData } from "../models";
import { MCApiError } from "../models/error";
/**
 * A custom RxJS operator that taps into an HTTP response observable to extract and process the data payload.
 * It provides overloaded signatures to handle both direct ResponseDto objects and raw HttpResponse wrappers.
 * The operator validates the response format and throws MCApiError for unsuccessful responses.
 *
 * @template T The ResponseDto type that extends ResponseDto<K>
 * @template K The type of the actual data payload within the ResponseDto
 * @param callback A function that is called with the unwrapped data payload when a successful response is received
 * @param options Optional configuration object with isRaw flag to indicate HttpResponse wrapper handling
 * @returns An RxJS operator function that can be applied to observables of ResponseDto<K> or HttpResponse<ResponseDto<K>>
 * @throws {MCApiError} When the response indicates failure (success: false)
 * @throws {Error} When the response type is not supported
 *
 * @example
 * // For direct ResponseDto
 * source$.pipe(
 *   tapResponseData((data) => console.log('Success:', data))
 * )
 *
 * @example
 * // For HttpResponse<ResponseDto>
 * source$.pipe(
 *   tapResponseData((data) => console.log('Success:', data), { isRaw: true })
 * )
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

type UnwrapResponseHttp<T> =
  T extends HttpResponse<infer U> ? UnwrapResponseHttp<U> : UnwrapResponseData<T>;

export function tapResponseData<T extends ResponseDto<K>, K>(
  callback: (data: UnwrapResponseHttp<T>) => void
): (source$: Observable<T>) => Observable<T>;
export function tapResponseData<T extends HttpResponse<ResponseDto<K>>, K>(
  callback: (data: UnwrapResponseHttp<T>) => void,
  options: {
    isRaw: true;
  }
): (source$: Observable<T>) => Observable<T>;
export function tapResponseData<
  T extends ResponseDto<K> | HttpResponse<ResponseDto<K>>,
  K,
>(
  callback: (data: UnwrapResponseHttp<T>) => void,
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
            callback(response.result as UnwrapResponseHttp<T>);
          } else {
            throw MCApiError.fromResponse(response as ErrorResponseDto);
          }
        } else {
          throw new Error("Unsupported response type");
        }
      })
    );
}

let i: Observable<HttpResponse<ResponseDto<{ id: number }>>>;
