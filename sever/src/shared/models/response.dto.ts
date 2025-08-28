import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

export class BaseResponseDto {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  timestamp: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  method: string;
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
