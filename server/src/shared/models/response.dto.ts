import { MESSAGE_SUCCESS } from '@app/constants';
import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { HttpStatusCode } from 'axios';
import { PaginationMetaDto } from './pagination-meta.dto';

export class BaseResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;
  @ApiProperty({
    description: 'Response message',
    example: 'Success',
  })
  message: string;
  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp?: string;
  @ApiProperty({
    description: 'Requested URL',
    example: '/api/endpoint',
  })
  url?: string;
  @ApiProperty({
    description: 'HTTP method used',
    example: 'GET',
  })
  method?: string;
}

export class ErrorResponseDto extends BaseResponseDto {
  @ApiProperty({
    default: false,
  })
  success: false;
  @ApiProperty()
  errorCode: string;
}

export class SuccessResponseDto<T> extends BaseResponseDto {
  @ApiProperty({
    default: true,
  })
  success: true;
  @ApiProperty()
  result: T;
}

export type SingleResponseDto<T> = SuccessResponseDto<{ data: T }>;

export type ListResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { count?: number };
}>;

export type PaginationResponseDto<T> = SuccessResponseDto<{
  items: T[];
  meta: { pagination: PaginationMetaDto };
}>;

export type ValidatorErrorDto = {
  property: string;
  constraints?: { [key: string]: string };
};

export type ValidatorResponseDto = ErrorResponseDto & {
  result: {
    meta: {
      validators: ValidatorErrorDto[];
    };
  } | null;
};

export class ValidatorException extends BadRequestException {
  meta: { validators: ValidatorErrorDto[] };
  constructor(validators: ValidatorErrorDto[]) {
    super({
      message: 'App.ValidationError',
    });
    this.meta = { validators };
  }
}

export type FileImportValidatorErrorDto = {
  index: number;
  property: string;
  constraints?: { [key: string]: string };
};

export type FileImportResponseDto = SuccessResponseDto<{
  result: {
    meta: {
      failureCount: number;
      validators: FileImportValidatorErrorDto[];
    };
  } | null;
}>;

export class FileImportValidatorException extends BadRequestException {
  meta: { failureCount: number; validators: FileImportValidatorErrorDto[] };
  constructor(validators: FileImportValidatorErrorDto[]) {
    super({
      message: 'App.ValidationError',
    });
    this.meta = { failureCount: validators.length, validators };
  }
}

type ResponseResult<T> = T extends SuccessResponseDto<infer U> ? U : never;

export class ResponseBuilder {
  static toSingle<T>(
    result: ResponseResult<SingleResponseDto<T>>,
    options?: {
      message?: string;
      statusCode?: number;
    },
  ): Partial<SingleResponseDto<T>> {
    return {
      result,
      statusCode: options?.statusCode ?? HttpStatusCode.Ok,
      message: options?.message ?? MESSAGE_SUCCESS.DEFAULT,
    };
  }

  static toList<T>(
    result: ResponseResult<ListResponseDto<T>>,
    options?: {
      message?: string;
      statusCode?: number;
    },
  ): Partial<ListResponseDto<T>> {
    return {
      result,
      statusCode: options?.statusCode ?? HttpStatusCode.Ok,
      message: options?.message ?? MESSAGE_SUCCESS.DEFAULT,
    };
  }

  static toPagination<T>(
    result: ResponseResult<PaginationResponseDto<T>>,
    options?: {
      message?: string;
      statusCode?: number;
    },
  ): Partial<PaginationResponseDto<T>> {
    return {
      result,
      statusCode: options?.statusCode ?? HttpStatusCode.Ok,
      message: options?.message ?? MESSAGE_SUCCESS.DEFAULT,
    };
  }
}
