import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { catchError, OperatorFunction } from "rxjs";

/**
 * A custom RxJS operator that maps HTTP validation errors to NgRx event actions.
 * It specifically handles HTTP 400 Bad Request errors and maps them to the provided error action creator.
 *
 * @template T The type of the HTTP response data.
 * @template TErrorAction The type of the validation error action.
 * @param validationErrorActionCreator A function that creates a validation error action from the HttpErrorResponse.
 *
 * @returns An RxJS operator function that catches validation errors, maps them to error actions,
 *          and then completes the stream. Other errors are re-thrown.
 */
export function mapToValidationErrorAction<T, TErrorAction>(
  validationErrorActionCreator: (error: HttpErrorResponse) => TErrorAction
): OperatorFunction<unknown, unknown> {
  return catchError((error: HttpErrorResponse | Error) => {
    // Check if the error is an HttpErrorResponse with status code 400 (Bad Request)
    if (
      error instanceof HttpErrorResponse &&
      error.status === HttpStatusCode.BadRequest
    ) {
      // Map the validation error to the provided error action
      const validationErrorAction = validationErrorActionCreator(error);

      // Return the validation error action as an observable
      return [validationErrorAction];
    }

    // Re-throw other errors to be handled elsewhere in the observable chain
    throw error;
  });
}
