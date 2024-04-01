import { PaginationMetaDto } from './pagination-meta.dto';

export interface ResponseDto<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  result?: T;
  timestamp: string;
  url: string;
  method: string;
}

export interface SingleResponseDto<T> extends ResponseDto {
  result: T;
}

export interface ListResponseDto<T> extends ResponseDto {
  result: {
    items: T[];
    meta: { count?: number };
  };
}

export interface PaginationResponseDto<T> extends ResponseDto {
  result: {
    items: T[];
    meta: { pagination: PaginationMetaDto };
  };
}

export interface ErrorResponseDto extends ResponseDto {}

export interface ValidatorResponseDto extends ResponseDto {
  result: {
    meta: {
      validators: {
        property: string;
        constraints: { [key: string]: string };
      }[];
    };
  };
}
