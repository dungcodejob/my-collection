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

export type UnwrapResponse<T> = T extends ResponseDto<infer S> ? S : never;
