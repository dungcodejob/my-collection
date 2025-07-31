import { HttpEvent, HttpResponse } from "@angular/common/http";
import { map, Observable, OperatorFunction } from "rxjs";
import { MCApiError } from "../models/error";
import { HttpClientResponse } from "../models/http-client-response";
import { MCApiResponse, ResponseDto, SuccessResponseDto } from "../models/response.dto";

/**
 * A custom RxJS operator that maps HTTP response data to NgRx event actions.
 * It handles different response types ('body', 'response', 'events') and maps successful responses to actions.
 *
 * @template T The type of the HTTP response data.
 * @template K The type of the data payload expected in the successful response.
 * @template TSuccessAction The type of the success action.
 * @template TErrorAction The type of the error action.
 * @param successActionCreator A function that creates a success action from the extracted data payload.
 * @param errorActionCreator A function that creates an error action from the API error.
 *
 * @returns An RxJS operator function that maps successful responses to success actions
 *          and API errors to error actions.
 */
export function mapToResponseDataAction<
  T extends HttpClientResponse<ResponseDto<K>>,
  K,
  TSuccessAction,
  TErrorAction,
>(
  successActionCreator: (data: K) => TSuccessAction,
  errorActionCreator: (error: MCApiError) => TErrorAction
): OperatorFunction<T, TSuccessAction | TErrorAction> {
  return (source$: Observable<T>): Observable<TSuccessAction | TErrorAction> =>
    source$.pipe(
      map(res => {
        if (MCApiResponse.isRaw(res)) {
          const response = res.body as ResponseDto<K>;

          if (response.success) {
            return successActionCreator(response.result);
          } else {
            const apiError = MCApiError.fromResponse(response);
            return errorActionCreator(apiError);
          }
        } else if (MCApiResponse.is(res)) {
          if (res.success) {
            return successActionCreator(res.result);
          } else {
            const apiError = MCApiError.fromResponse(res);
            return errorActionCreator(apiError);
          }
        }

        // Fallback case - should not happen with proper typing
        throw new Error("Unsupported response type");
      })
    );
}

type UnHttpClientResponse<T> =
  T extends ResponseDto<infer S>
    ? SuccessResponseDto<S>
    : T extends HttpResponse<ResponseDto<infer D>>
      ? SuccessResponseDto<D>
      : T extends HttpEvent<ResponseDto<infer F>>
        ? SuccessResponseDto<F>
        : never;

/**
 * A simplified version that only maps successful responses to actions and throws errors for failed responses.
 * This is useful when you want to handle errors separately in the effect chain.
 *
 * @template T The type of the HTTP response data.
 * @template K The type of the data payload expected in the successful response.
 * @template TSuccessAction The type of the success action.
 * @param successActionCreator A function that creates a success action from the extracted data payload.
 *
 * @returns An RxJS operator function that maps successful responses to success actions
 *          and throws MCApiError for failed responses.
 */
export function mapToSuccessAction<
  T extends HttpClientResponse<ResponseDto<K>>,
  K extends UnHttpClientResponse<T>["result"],
  TSuccessAction,
>(
  successActionCreator: (data: K) => TSuccessAction
): OperatorFunction<T, TSuccessAction> {
  return (source$: Observable<T>): Observable<TSuccessAction> =>
    source$.pipe(
      map(res => {
        if (MCApiResponse.isRaw(res)) {
          const response = res.body as ResponseDto<K>;

          if (response.success) {
            return successActionCreator(response.result);
          } else {
            throw MCApiError.fromResponse(response);
          }
        } else if (MCApiResponse.is(res)) {
          if (res.success) {
            return successActionCreator(res.result);
          } else {
            throw MCApiError.fromResponse(res);
          }
        }

        // Fallback case - should not happen with proper typing
        throw new Error("Unsupported response type");
      })
    );
}
