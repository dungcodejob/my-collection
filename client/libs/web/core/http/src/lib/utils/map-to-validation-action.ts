import { HttpErrorResponse } from "@angular/common/http";
import { EventInstance } from "@ngrx/signals/events";
import { catchError, OperatorFunction, of } from "rxjs";

/**
 * Structured validation error payload for NgRx Signal actions
 * 
 * CONTEXT: Form Validation Error Handling
 * PATTERN: Structured Error Payload with Field-Level Validation Messages
 * 
 * @category HTTP Error Handling
 * @subcategory Form Validation
 */
export interface ValidationErrorPayload {
  /** Field-level validation errors mapping field names to error message arrays */
  validationErrors: Record<string, string[]>;
  /** General validation error message */
  message?: string;
}

/**
 * Maps HTTP 422 validation errors to NgRx Signal validation actions with structured error payload
 * 
 * CONTEXT: NgRx Signals Form Validation Error Handling
 * PATTERN: Selective Error Handling for HTTP 422 Status with Field-Level Error Extraction
 * RELATED: mapToErrorAction, mapToSuccessAction, mapHttpResponse
 * STRATEGY: Only handles 422 validation errors, re-throws other errors for upstream handling
 * 
 * This operator specifically handles HTTP 422 (Unprocessable Entity) responses:
 * - Extracts field-level validation errors from response.error.errors
 * - Creates structured ValidationErrorPayload with field mappings
 * - Supports optional callback for side effects (form highlighting, notifications)
 * - Re-throws non-422 errors to be handled by other error operators
 * 
 * @category HTTP Error Handling
 * @subcategory Form Validation
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * // Basic form validation handling
 * this.http.post<User>('/api/users', formData)
 *   .pipe(
 *     mapToSuccessAction(userActions.createUserSuccess),
 *     mapToValidationAction(userActions.createUserValidationError),
 *     mapToErrorAction(userActions.createUserError)
 *   )
 * 
 * // With form field highlighting
 * this.http.put<User>('/api/users/1', userData)
 *   .pipe(
 *     mapToSuccessAction(userActions.updateUserSuccess),
 *     mapToValidationAction(
 *       userActions.updateUserValidationError,
 *       (error) => this.highlightInvalidFields(error.error?.errors)
 *     ),
 *     mapToErrorAction(userActions.updateUserError)
 *   )
 * 
 * // Custom validation error handling
 * this.http.post<Product>('/api/products', productData)
 *   .pipe(
 *     mapToSuccessAction(productActions.createProductSuccess),
 *     mapToValidationAction(
 *       productActions.createProductValidationError,
 *       (error) => {
 *         this.formService.markFieldsAsInvalid(error.error?.errors);
 *         this.notificationService.showValidationErrors(error.error?.errors);
 *       }
 *     )
 *   )
 * ```
 * 
 * @param validationActionCreator Action creator from eventGroup that creates validation error actions
 * @param callback Optional callback for side effects (form highlighting, field focus, notifications)
 * @returns RxJS operator that catches 422 errors and transforms them to validation actions
 * 
 * ERROR_HANDLING: Only handles HTTP 422 status, re-throws other errors for upstream handling
 * SIDE_EFFECT: Optional callback executed before action dispatch for form UI updates
 * RETURN: Observable<T | EventInstance<string, ValidationErrorPayload>> - continues stream with validation action
 */
export function mapToValidationAction<T>(
  validationActionCreator: (payload: ValidationErrorPayload) => EventInstance<string, ValidationErrorPayload>,
  callback?: (error: HttpErrorResponse) => void
): OperatorFunction<T, T | EventInstance<string, ValidationErrorPayload>> {
  return catchError((error: HttpErrorResponse) => {
    // STEP 1: Check if this is a validation error (HTTP 422)
    // PATTERN: Selective error handling based on HTTP status code
    if (error.status === 422) {
      // STEP 2: Execute optional side effects for form UI updates
      // PATTERN: Side effect execution for form field highlighting and user feedback
      if (callback) {
        callback(error);
      }

      // STEP 3: Extract and structure validation errors from response
      // PATTERN: Field-level error extraction with fallback handling
      const validationPayload: ValidationErrorPayload = {
        // Extract field-level validation errors (e.g., { "email": ["Email is required"], "name": ["Name too short"] })
        validationErrors: error.error?.errors || {},
        // Extract general validation message with fallback
        message: error.error?.message || 'Validation failed'
      };

      // STEP 4: Create and return NgRx Signal validation action
      // PATTERN: Validation action dispatch with structured field-level errors
      // RETURN: Observable<ValidationAction> to continue the stream with validation errors
      return of(validationActionCreator(validationPayload));
    }

    // STEP 5: Re-throw non-validation errors for upstream handling
    // PATTERN: Error delegation - let other error operators handle non-422 errors
    // STRATEGY: Chain with mapToErrorAction to handle general HTTP errors
    throw error;
  });
}