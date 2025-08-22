import { HttpResponse } from "@angular/common/http";
import { ErrorResponseDto } from "./error-response.dto";
import { SuccessResponseDto } from "./success-response.dto";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BaseResponseDto = Readonly<{
  statusCode: number;
  message: string;
  description?: string;
  timestamp: string;
  url: string;
  method: HttpMethod;
}>;

export type ResponseDto<T = unknown> = ErrorResponseDto | SuccessResponseDto<T>;

export type UnwrapResponseData<T> = T extends ResponseDto
  ? T extends SuccessResponseDto<infer S>
    ? S
    : never
  : never;

export type UnwrapResponseHttp<T> =
  T extends HttpResponse<infer U> ? UnwrapResponseHttp<U> : UnwrapResponseData<T>;
