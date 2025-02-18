import { EMPTY, catchError, pipe, tap } from "rxjs";
import { ErrorResponseDto, ResponseDto } from "../models/response.dto";
import { HttpErrorResponse } from "@angular/common/http";

/**
 * A custom RxJS operator that taps into the observable stream to handle HTTP errors.
 * It invokes a callback function with the error and then completes the stream,
 * preventing further emissions.
 *
 * @param callback A function to be called when an HTTP error occurs.
 *                 This function receives the HttpErrorResponse object.
 *
 * @returns An RxJS operator function that catches HTTP errors, calls the callback function,
 *          and then returns EMPTY to complete the stream, preventing subsequent values from being emitted.
 */
export function tapResponseFailed<T>(callback: (data: ErrorResponseDto) => void) {
  /**
   * Catches errors in the observable stream and handles them gracefully.
   */
  return pipe(
    tap((res: ResponseDto<T>) => {
      if (!res.success) {
        callback(res);
      }
    })
  );
}
