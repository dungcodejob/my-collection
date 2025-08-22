import { BaseResponseDto } from "./base-response.dto";
import { PaginationMetaDto } from "./pagination.dto";

export type SuccessResponseDto<T> = {
  success: true;
  result: T;
} & BaseResponseDto;

export type SingleResponseDto<T> = SuccessResponseDto<{ data: T }>;
export type ListResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { count: number };
}>;
export type PaginationResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { pagination: PaginationMetaDto };
}>;
