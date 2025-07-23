import { HttpErrorResponse } from "@angular/common/http";
import { EventInstance } from "@ngrx/signals/events";
import { catchError, of, OperatorFunction } from "rxjs";

/**
 * Maps HTTP errors to NgRx Signal error actions with intelligent error payload creation
 * 
 * CONTEXT: NgRx Signals HTTP Error Handling
 * PATTERN: Error-to-Action Transformation with Structured Error Payload
 * RELATED: mapToSuccessAction, mapHttpResponse, tapError
 * STRATEGY: Automatic error payload creation with optional side effects for logging/notifications
 * 
 * This operator catches HTTP errors and transforms them into structured error actions:
 * - Extracts error message from response.error.message or response.message
 * - Creates structured error payload with status, statusText, and URL
 * - Supports optional callback for side effects (logging, notifications, analytics)
 * - Returns Observable<ErrorAction> to continue the stream
 * 
 * @category HTTP Error Handling
 * @subcategory NgRx Signals Integration
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * // Basic error handling
 * this.http.get<User>('/api/users/1')
 *   .pipe(
 *     mapToSuccessAction(userActions.loadUserSuccess),
 *     mapToErrorAction(userActions.loadUserError)
 *   )
 * 
 * // With error logging and user notification
 * this.http.post<User>('/api/users', userData)
 *   .pipe(
 *     mapToSuccessAction(userActions.createUserSuccess),
 *     mapToErrorAction(
 *       userActions.createUserError,
 *       (error) => {
 *         console.error('User creation failed:', error);
 *         this.notificationService.showError('Failed to create user');
 *       }
 *     )
 *   )
 * 
 * // Custom error payload type
 * interface CustomErrorPayload {
 *   message: string;
 *   code: string;
 *   timestamp: Date;
 * }
 * 
 * this.http.get<Data>('/api/data')
 *   .pipe(
 *     mapToErrorAction<Data, CustomErrorPayload>(
 *       dataActions.loadDataError,
 *       (error) => this.analytics.trackError(error)
 *     )
 *   )
 * ```
 * 
 * @param errorActionCreator Action creator from eventGroup that creates the error action
 * @param callback Optional callback for side effects (logging, notifications, analytics)
 * @returns RxJS operator that catches errors and transforms them to error actions
 * 
 * ERROR_HANDLING: Catches HttpErrorResponse and transforms to structured error payload
 * SIDE_EFFECT: Optional callback executed before action dispatch for logging/notifications
 * RETURN: Observable<T | EventInstance<string, TErrorPayload>> - continues stream with error action
 */
export function mapToErrorAction<T, TErrorPayload = unknown>(
  errorActionCreator: (payload: TErrorPayload) => EventInstance<string, TErrorPayload>,
  callback?: (error: HttpErrorResponse) => void
): OperatorFunction<T, T | EventInstance<string, TErrorPayload>> {
  return catchError((error: HttpErrorResponse) => {
    // STEP 1: Execute optional side effects before error processing
    // PATTERN: Side effect execution for logging, notifications, analytics
    if (callback) {
      callback(error);
    }

    // STEP 2: Create structured error payload with intelligent message extraction
    // PATTERN: Error payload normalization with fallback hierarchy
    const errorPayload = {
      // Extract error message with fallback chain: error.error.message -> error.message -> default
      error: error.error?.message || error.message || 'An error occurred',
      details: {
        // HTTP status information for debugging and user feedback
        status: error.status,
        statusText: error.statusText,
        url: error.url
      }
    } as TErrorPayload;

    // STEP 3: Create and return NgRx Signal error action
    // PATTERN: Error action dispatch with structured payload
    // RETURN: Observable<ErrorAction> to continue the stream without breaking it
    return of(errorActionCreator(errorPayload));
  });
}
