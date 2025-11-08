import { MESSAGE_SUCCESS } from '@app/constants';
import { HttpStatus } from '@nestjs/common';
import { PaginationMetaDto } from './pagination-meta.dto';

type ResultOptions = { status: number; message: string };
type SingleResultOptions<T> = Partial<ResultOptions> & { data: T };
type ListResultOptions<T> = Partial<ResultOptions> & {
  items: T[];
  count?: number;
};
type PaginationResultOptions<T> = Partial<ResultOptions> & {
  items: T[];
  pagination: PaginationMetaDto;
};

export class ResultDto {
  readonly statusCode: number;
  readonly message: string;

  constructor(options?: Partial<ResultOptions>) {
    this.statusCode = options?.status || HttpStatus.OK;
    this.message = options?.message || MESSAGE_SUCCESS.DEFAULT;
  }
}

export class SingleResultDto<T> extends ResultDto {
  readonly data: T;

  constructor(options: SingleResultOptions<T>) {
    super(options);
    this.data = options.data;
  }
}

export class ListResultDto<T> extends ResultDto {
  readonly items: T[];
  readonly count?: number;
  constructor(options: ListResultOptions<T>) {
    super(options);
    this.items = options.items;
    this.count = options.count || options.items.length;
  }
}

export class PaginationResultDto<T> extends ResultDto {
  readonly items: T[];
  readonly meta: { pagination: PaginationMetaDto };

  constructor(options: PaginationResultOptions<T>) {
    super(options);
    this.items = options.items;
    this.meta = { pagination: options.pagination };
  }
}

// export class Result {
//   static toSingle<T>(options: SingleResultOptions<T>): SingleResultDto<T> {
//     return new SingleResultDto(options);
//   }

//   static toList<T>(options: ListResultOptions<T>): ListResultDto<T> {
//     return new ListResultDto(options);
//   }

//   static toPagination<T>(
//     options: PaginationResultOptions<T>,
//   ): PaginationResultDto<T> {
//     return new PaginationResultDto(options);
//   }
// }
