import { HttpResponse } from "@angular/common/http";
import { isPlainObject } from "@client/web-shared-utils";
import { HttpClientResponse } from "./http-client-response";
import { PaginationMetaDto } from "./pagination.dto";
import { ValidationMetaDto } from "./validation-meta.dto";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BaseResponseDto = Readonly<{
  statusCode: number;
  message: string;
  description?: string;
  timestamp: string;
  url: string;
  method: HttpMethod;
}>;

export type ErrorResponseDto = {
  success: false;
  errorCode: string;
} & BaseResponseDto;

export type SuccessResponseDto<T> = {
  success: true;
  result: T;
} & BaseResponseDto;

export type ResponseDto<T = unknown> = ErrorResponseDto | SuccessResponseDto<T>;

export type ValidatorResponseDto = {
  readonly errorCode: "BadRequest";
  readonly result: Readonly<{ meta: { validators: ValidationMetaDto[] } }>;
} & ErrorResponseDto;

export type SingleResponseDto<T> = SuccessResponseDto<{ data: T }>;
export type ListResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { count: number };
}>;
export type PaginationResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { pagination: PaginationMetaDto };
}>;

export type UnwrapResponse<T> = T extends ResponseDto<infer S> ? S : never;

export class MCApiResponse {
  /**
   * Checks if the emitted value from the HTTP response observable is an instance of `HttpResponse`
   * and contains a successful API response body.
   *
   * This function is specifically designed to handle responses when the `observe` option in `HttpClient`
   * is set to 'response' or 'events', where the response is wrapped in an `HttpEvent` object.
   *
   * @template T The type of the data payload expected in the successful response.
   * @param value The emitted value from the HTTP response observable.
   * @returns `true` if the value is an `HttpResponse` containing a successful response body, otherwise `false`.
   */
  static isRaw<T extends ResponseDto<any>>(
    value: HttpClientResponse<T>
  ): value is HttpResponse<T> {
    return value instanceof HttpResponse && MCApiResponse.is<T>(value.body!);
  }

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
  static is<T extends ResponseDto<any>>(response: HttpClientResponse<T>): response is T {
    return (
      !!response &&
      isPlainObject(response as Record<string, unknown>) &&
      "result" in response &&
      response.success === true
    );
  }
}
