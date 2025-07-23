import { HttpEvent, HttpResponse } from "@angular/common/http";
import { EventInstance } from "@ngrx/signals/events";
import { map, OperatorFunction } from "rxjs";
import { HttpClientResponse } from "../models/http-client-response";
import { MCApiResponse, SuccessResponseDto } from "../models/response.dto";

/**
 * Maps HTTP responses to NgRx Signal success actions with intelligent data extraction
 *
 * CONTEXT: NgRx Signals HTTP Response Mapping
 * PATTERN: Response-to-Action Transformation with Advanced Type Inference
 * RELATED: mapToErrorAction, mapHttpResponse, handleHttpResponseForNgrx
 * STRATEGY: Automatic type inference from action creator parameter types
 *
 * This operator intelligently extracts data from different HTTP response types:
 * - SuccessResponseDto: Extracts .result property
 * - HttpEvent/HttpResponse: Extracts .body.result property
 * - Raw objects: Uses as-is
 *
 * TYPE INFERENCE: Automatically infers TData from action creator parameter type,
 * eliminating the need for explicit generic type parameters in most cases.
 * Uses advanced TypeScript conditional types to extract payload types.
 *
 * @category HTTP Response Mapping
 * @subcategory NgRx Signals Integration
 * @version 2.2.0
 *
 * @example
 * ```typescript
 * // Automatic type inference from action creator parameter
 * const userEvents = eventGroup({
 *   source: "User",
 *   events: {
 *     loadUserSuccess: type<User>(),           // TData automatically inferred as User
 *     loadUsersSuccess: type<User[]>(),        // TData automatically inferred as User[]
 *     createUserSuccess: type<{ user: User }>() // TData automatically inferred as { user: User }
 *   }
 * });
 *
 * // Perfect type inference - no generics needed!
 * this.http.get<SuccessResponseDto<User>>('/api/users/1')
 *   .pipe(
 *     mapToSuccessAction(userEvents.loadUserSuccess) // ✅ TData = User (inferred!)
 *   )
 *
 * // Type-safe callback with inferred types
 * this.http.post<SuccessResponseDto<User>>('/api/users', userData)
 *   .pipe(
 *     mapToSuccessAction(
 *       userEvents.createUserSuccess,
 *       (user: User) => {  // ✅ Type inferred from action creator
 *         console.log('Created user:', user.name);
 *         this.router.navigate(['/users', user.id]);
 *       }
 *     )
 *   )
 *
 * // Explicit type when action creator is generic
 * this.http.get<SuccessResponseDto<User[]>>('/api/users')
 *   .pipe(
 *     mapToSuccessAction<User[]>(userEvents.loadUsersSuccess)
 *   )
 * ```
 *
 * @param successActionCreator Action creator from eventGroup that creates the success action
 * @param callback Optional callback for side effects (logging, notifications, navigation)
 * @returns RxJS operator that transforms HTTP responses to success actions
 *
 * ERROR_HANDLING: Does not handle errors - use with catchError or mapHttpResponse
 * SIDE_EFFECT: Optional callback executed before action dispatch
 * RETURN: EventInstance<string, TPayload> for NgRx Signals store
 * TYPE_SAFETY: Advanced type inference eliminates unknown types completely
 * PERFORMANCE: Zero runtime overhead for type inference
 */

// TYPE HELPER: Extract payload type from action creator function
type ExtractPayloadType<T> = T extends (payload?: infer P) => any ? P : never;

// TYPE HELPER: Extract data type from different response formats
type ExtractDataType<T> =
  T extends SuccessResponseDto<infer U> ? U :
  T extends HttpEvent<SuccessResponseDto<infer U>> ? U :
  T extends HttpResponse<SuccessResponseDto<infer U>> ? U :
  T extends HttpClientResponse<SuccessResponseDto<infer U>> ? U :
  never;

// OVERLOAD 1: Infer TData from action creator parameter type
export function mapToSuccessAction<
  TActionCreator extends (payload?: any) => EventInstance<string, any>
>(
  successActionCreator: TActionCreator,
  callback?: (response: ExtractPayloadType<TActionCreator>) => void
): OperatorFunction<
  HttpClientResponse<SuccessResponseDto<ExtractPayloadType<TActionCreator>>>, 
  ReturnType<TActionCreator>
>;

// OVERLOAD 2: Explicit TData type when needed
export function mapToSuccessAction<TData>(
  successActionCreator: (payload?: TData) => EventInstance<string, any>,
  callback?: (response: TData) => void
): OperatorFunction<HttpClientResponse<SuccessResponseDto<TData>>, EventInstance<string, any>>;

// IMPLEMENTATION: Combined implementation for both overloads
export function mapToSuccessAction<
  TActionCreator extends (payload?: any) => EventInstance<string, any>
>(
  successActionCreator: TActionCreator,
  callback?: (response: ExtractPayloadType<TActionCreator>) => void
): OperatorFunction<
  HttpClientResponse<SuccessResponseDto<ExtractPayloadType<TActionCreator>>>, 
  ReturnType<TActionCreator>
> {
  type TData = ExtractPayloadType<TActionCreator>;
  
  return map((response) => {
    // STEP 1: Intelligent data extraction based on response type
    // PATTERN: Type-safe response unwrapping with fallback handling
    // STRATEGY: Runtime type checking with compile-time type safety
    let extractedData: TData;

    // GUARD: Multi-format response handling with type guards
    if (MCApiResponse.isRaw<SuccessResponseDto<TData>>(response)) {
      // HTTP wrapper response (HttpEvent/HttpResponse) - extract from body.result
      // PATTERN: Nested property access with null assertion (body guaranteed by type guard)
      extractedData = response.body!.result as TData;
    } else if (MCApiResponse.is<SuccessResponseDto<TData>>(response)) {
      // Direct SuccessResponseDto - extract from result property
      // PATTERN: Direct property access for unwrapped responses
      extractedData = (response as SuccessResponseDto<TData>).result;
    } else {
      // GUARD: Ensure response format is valid
      // ERROR_HANDLING: Fail fast with descriptive error for invalid formats
      throw new Error('Invalid response format: Expected SuccessResponseDto or HTTP wrapper');
    }

    // STEP 2: Execute optional side effects before action dispatch
    // PATTERN: Side effect execution with extracted data
    // SIDE_EFFECT: Callback execution for logging, navigation, notifications
    if (callback) {
      callback(extractedData);
    }

    // STEP 3: Create and return NgRx Signal action with extracted data
    // PATTERN: Action creation with type-safe payload
    // RETURN: EventInstance for NgRx Signals store integration
    return successActionCreator(extractedData);
  });
}



