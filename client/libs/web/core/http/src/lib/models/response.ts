import { HttpResponse } from "@angular/common/http";
import { isPlainObject } from "@client/web-shared-utils";
import { ResponseDto } from "./base-response.dto";
import { HttpClientResponse } from "./http-client-response";

export class MCResponse {
  /**
   * Checks if a value is a plain object and represents a successful API response.
   *
   * This function verifies if the value has the correct structure of an `ApiSuccessResponse`,
   * including the `data` property and a `status` of 'ok'.
   *
   * @template T The type of the data payload expected in the successful response.
   * @param response The value to check.
   * @returns `true` if the value is a plain object representing a successful API response, otherwise `false`.
   */
  static is<T extends ResponseDto>(response: HttpClientResponse<T>): response is T;
  static is<T extends ResponseDto>(
    response: HttpClientResponse<T>,
    options: {
      isRaw: true;
    }
  ): response is HttpResponse<T>;
  static is<T extends ResponseDto>(
    response: HttpClientResponse<T>,
    options?: {
      isRaw: boolean;
    }
  ): response is T | HttpResponse<T> {
    if (options?.isRaw) {
      return (
        response instanceof HttpResponse && MCResponse.is(response.body as ResponseDto)
      );
    }

    return (
      !!response &&
      isPlainObject(response as Record<string, unknown>) &&
      "result" in response
    );
  }
}
