import { OperatorFunction } from "rxjs";
import { HttpClientResponse } from "../models/http-client-response";
import { MCApiResponse, SuccessResponseDto } from "../models/response.dto";
import { ActionCreator } from "./map-to-success-action";
import { ErrorActionCreator, mapToErrorAction } from "./map-to-error-action";
import { ValidationErrorActionCreator, mapToValidationAction } from "./map-to-validation-action";
import { mapToSuccessAction } from "./map-to-success-action";

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
        mapToValidationAction(validationErrorActionCreator)
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
      mapToErrorAction(errorActionCreator)
    );
  };
}