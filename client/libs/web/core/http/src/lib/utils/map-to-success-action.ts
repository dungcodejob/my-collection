import { HttpResponse } from "@angular/common/http";
import { Observable, OperatorFunction, map } from "rxjs";
import { ResponseDto } from "../models/base-response.dto";
import { MCApiError } from "../models/error";
import { MCResponse } from "../models/response";

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

export function mapToSuccessAction<K, TSuccessAction>(
  successActionCreator: (data: K) => TSuccessAction,
  options: {
    isRaw: true;
  }
): OperatorFunction<HttpResponse<ResponseDto<K>>, TSuccessAction>;
export function mapToSuccessAction<K, TSuccessAction>(
  successActionCreator: (data: K) => TSuccessAction
): OperatorFunction<ResponseDto<K>, TSuccessAction>;
export function mapToSuccessAction<K, TSuccessAction>(
  successActionCreator: (data: K) => TSuccessAction,
  options?: {
    isRaw: true;
  }
): OperatorFunction<HttpResponse<ResponseDto<K>> | ResponseDto<K>, TSuccessAction> {
  return (
    source$: Observable<HttpResponse<ResponseDto<K>> | ResponseDto<K>>
  ): Observable<TSuccessAction> =>
    source$.pipe(
      map(res => {
        let response: ResponseDto<K>;
        if (options?.isRaw) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          response = (res as HttpResponse<ResponseDto<K>>).body!;
        } else {
          response = res as ResponseDto<K>;
        }

        if (MCResponse.is(response)) {
          if (response.success) {
            return successActionCreator(response.result);
          } else {
            throw MCApiError.fromResponse(response);
          }
        }

        // Fallback case - should not happen with proper typing
        throw new Error("Unsupported response type");
      })
    );
}
