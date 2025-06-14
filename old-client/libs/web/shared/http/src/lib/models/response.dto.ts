import { HttpStatusCode } from "@angular/common/http";
import { PaginationMetaDto } from "./pagination-meta.dto";
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

export interface ErrorResponseDto extends BaseResponseDto {
  success: false;
  errorCode: string;
}

export interface SuccessResponseDto<T> extends BaseResponseDto {
  success: true;
  result: T;
}

export type ResponseDto<T = unknown> = ErrorResponseDto | SuccessResponseDto<T>;

export interface ValidatorResponseDto extends ErrorResponseDto {
  readonly errorCode: "BadRequest";
  readonly result: Readonly<{ meta: { validators: ValidationMetaDto[] } }>;
}

export type SingleResponseDto<T> = SuccessResponseDto<{ data: T }>;
export type ListResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { count: number };
}>;
export type PaginationResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { pagination: PaginationMetaDto };
}>;

export type UnResponse<T> = T extends ResponseDto<infer S> ? S : never;
