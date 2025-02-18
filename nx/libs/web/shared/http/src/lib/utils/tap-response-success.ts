import { ResponseDto, SuccessResponseDto } from "../models/response.dto";
import { tap } from "rxjs";
/**
 * A custom RxJS operator that taps into an HTTP response observable to extract the data payload.
 * It handles different response types ('body', 'response', 'events') and ensures a successful response format.
 *
 * @template T The type of the data payload expected in the successful response.
 * @param callback A function that is called with the extracted data payload when a successful response is received.
 * @returns An RxJS operator function that can be applied to an observable of HttpEvent<ApiSuccessResponse<T>>, ApiSuccessResponse<T>, or T.
 */
export function tapResponseSuccess<T>(
  callback: (data: SuccessResponseDto<T>["result"]) => void
) {
  return tap((res: ResponseDto<T>) => {
    if (res.success) {
      callback(res.result);
    }
  });
}
