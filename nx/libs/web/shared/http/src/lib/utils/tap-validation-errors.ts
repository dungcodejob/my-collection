import { tap } from "rxjs";
import { ResponseDto, ValidatorResponseDto } from "../models/response.dto";
import { ValidationMetaDto } from "../models/validation-meta.dto";
import { HttpStatusCode } from "@angular/common/http";

/**
 * A custom RxJS operator that taps into the observable stream to handle HTTP validation errors.
 *
 * @param callback A function to be called when a validation error (HTTP 400 Bad Request) occurs.
 *                 This function receives the HttpErrorResponse object containing the error details.
 *
 * @returns An RxJS operator function that catches validation errors, calls the callback function,
 *          and then completes the stream to prevent further processing.
 */
export function tapValidationErrors<T>(
  callback: (error: ValidatorResponseDto["result"]) => void
) {
  return tap((res: ResponseDto<T>) => {
    // Check if the error is an HttpErrorResponse with status code 400 (Bad Request), which is the format defined by the server
    if (!res.success && res.errorCode === "BadRequest") {
      // Invoke the callback to handle the validation error

      callback((res as ValidatorResponseDto).result);
    }
  });
}
