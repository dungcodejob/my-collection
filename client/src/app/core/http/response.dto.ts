import { PaginationMetaDto } from "./pagination-meta.dto";
import { ValidationMetaDto } from "./validation-meta.dto";

export type ResponseDto<T = unknown> = Readonly<{
  statusCode: number;
  success: boolean;
  message: string;
  description?: string;
  result: Readonly<T>;
  timestamp: string;
  url: string;
  method: string;
}>;

export type SingleResult<T> = { data: T };
export type SingleResponseDto<T> = ResponseDto<SingleResult<T>>;

export type ListResult<T> = { items: T[]; meta: { count: number } };
export type ListResponseDto<T> = ResponseDto<ListResult<T>>;

export type PaginationResult<T> = { items: T[]; meta: { pagination: PaginationMetaDto } };
export type PaginationResponseDto<T> = ResponseDto<PaginationResult<T>>;

export interface ErrorResponseDto extends ResponseDto {}
export interface ValidatorResponseDto extends ResponseDto {
  readonly result: Readonly<{ meta: { validators: ValidationMetaDto[] } }>;
}
