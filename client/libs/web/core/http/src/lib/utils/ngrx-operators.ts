import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { catchError, map, OperatorFunction, of, tap } from "rxjs";
import { HttpClientResponse } from "../models/http-client-response";
import { MCApiResponse, ResponseDto, SuccessResponseDto } from "../models/response.dto";

/**
 * NgRx-specific operators that properly handle action returns for Effects
 */

// ===== TYPE DEFINITIONS =====
export interface ActionCreator<T = any> {
  (payload: T): any;
}

export interface ErrorActionCreator {
  (payload: { error: string; details?: any }): any;
}

export interface ValidationErrorActionCreator {
  (payload: { errors: Record<string, string[]> }): any;
}

// ===== NGRX ERROR HANDLER =====
/**
 * NgRx-specific error handler that dispatches error actions instead of returning EMPTY
 * 
 * @param errorActionCreator Action creator để dispatch khi có lỗi
 * @param callback Optional callback để handle side effects
 */
export function catchHttpError<T>(
  errorActionCreator: ErrorActionCreator,
  callback?: (error: HttpErrorResponse) => void
): OperatorFunction<T, T | any> {
  return catchError((error: HttpErrorResponse) => {
    // Execute callback for side effects (logging, notifications, etc.)
    if (callback) {
      callback(error);
    }

    // Dispatch error action
    const errorMessage = error.error?.message || error.message || 'An error occurred';
    return of(errorActionCreator({ 
      error: errorMessage,
      details: {
        status: error.status,
        statusText: error.statusText,
        url: error.url
      }
    }));
  });
}

// ===== NGRX VALIDATION ERROR HANDLER =====
/**
 * NgRx-specific validation error handler for HTTP 400 errors
 * 
 * @param validationErrorActionCreator Action creator để dispatch validation errors
 * @param callback Optional callback để handle side effects
 */
export function catchValidationErrors<T>(
  validationErrorActionCreator: ValidationErrorActionCreator,
  callback?: (error: HttpErrorResponse) => void
): OperatorFunction<T, T | any> {
  return catchError((error: HttpErrorResponse | Error) => {
    // Check if it's a validation error (HTTP 400)
    if (
      error instanceof HttpErrorResponse &&
      error.status === HttpStatusCode.BadRequest
    ) {
      // Execute callback for side effects
      if (callback) {
        callback(error);
      }

      // Extract validation errors from response
      const validationErrors = error.error?.errors || {};
      
      // Dispatch validation error action
      return of(validationErrorActionCreator({ errors: validationErrors }));
    }

    // Re-throw other errors to be handled by other operators
    throw error;
  });
}

// ===== NGRX RESPONSE DATA MAPPER =====
/**
 * NgRx-specific response data mapper that extracts data and dispatches success actions
 * 
 * @param successActionCreator Action creator để dispatch success action
 * @param dataExtractor Optional function to extract data from response
 */
export function mapToSuccessAction<T, R>(
  successActionCreator: ActionCreator<R>,
  dataExtractor?: (response: T) => R
): OperatorFunction<T, any> {
  return map((response: T) => {
    const extractedData = dataExtractor ? dataExtractor(response) : (response as unknown as R);
    return successActionCreator(extractedData);
  });
}

// ===== UPLOAD PROGRESS OPERATOR =====
/**
 * NgRx-specific upload progress handler
 * 
 * @param progressActionCreator Action creator to dispatch progress updates
 * @param callback Optional callback để handle progress updates
 */
export function tapUploadProgressForNgrx<T>(
  progressActionCreator: ActionCreator<{ progress: number }>,
  callback?: (progress: number) => void
): OperatorFunction<T, T> {
  return tap((response: T) => {
    // Extract progress from response (assuming it has a progress property)
    const progress = (response as any)?.progress || 0;
    
    // Execute callback for side effects
    if (callback) {
      callback(progress);
    }
    
    // Dispatch progress action
    progressActionCreator({ progress });
  });
}

// ===== COMBINED OPERATORS =====
/**
 * Combined operator cho complete error handling trong NgRx Effects
 * 
 * @param successActionCreator Success action creator
 * @param errorActionCreator Error action creator  
 * @param validationErrorActionCreator Validation error action creator
 * @param callback Optional callback để handle extracted data
 */
export function handleHttpResponseForNgrx<T, K>(
  successActionCreator: ActionCreator<T>,
  errorActionCreator: ErrorActionCreator,
  validationErrorActionCreator?: ValidationErrorActionCreator,
  callback?: (data: K) => void
): OperatorFunction<HttpClientResponse<SuccessResponseDto<K>>, any> {
  return (source$) => {
    let stream$ = source$;
    
    // Handle validation errors first (if provided)
    if (validationErrorActionCreator) {
      stream$ = stream$.pipe(
        catchValidationErrors(validationErrorActionCreator)
      );
    }
    
    return stream$.pipe(
      // Map successful responses to success actions
      mapToSuccessAction(successActionCreator, (response: HttpClientResponse<SuccessResponseDto<K>>) => {
        let extractedData: K;
        
        // Extract data based on response type
        if (MCApiResponse.isRaw<SuccessResponseDto<K>>(response)) {
          extractedData = response.body!.result;
        } else if (MCApiResponse.is<SuccessResponseDto<K>>(response)) {
          extractedData = response.result;
        } else {
          throw new Error('Invalid response format');
        }

        // Execute callback for side effects
        if (callback) {
          callback(extractedData);
        }

        return extractedData as unknown as T;
      }),
      
      // Handle general errors
      catchHttpError(errorActionCreator)
    );
  };
}

/**
 * Simplified operator cho basic success/error handling
 */
export function mapHttpResponse<T, K>(
  successActionCreator: ActionCreator<T>,
  errorActionCreator: ErrorActionCreator,
  callback?: (data: K) => void
): OperatorFunction<HttpClientResponse<SuccessResponseDto<K>>, any> {
  return (source$) => {
    return source$.pipe(
      mapToSuccessAction(successActionCreator, (response: HttpClientResponse<SuccessResponseDto<K>>) => {
        let extractedData: K;
        
        // Extract data based on response type
        if (MCApiResponse.isRaw<SuccessResponseDto<K>>(response)) {
          extractedData = response.body!.result;
        } else if (MCApiResponse.is<SuccessResponseDto<K>>(response)) {
          extractedData = response.result;
        } else {
          throw new Error('Invalid response format');
        }

        // Execute callback for side effects
        if (callback) {
          callback(extractedData);
        }

        return extractedData as unknown as T;
      }),
      catchHttpError(errorActionCreator)
    );
  };
}