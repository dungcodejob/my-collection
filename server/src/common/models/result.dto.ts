import { PaginationMetaDto } from './pagination-meta.dto';

export class SingleResultDto<T> {
  readonly data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class ListResultDto<T> {
  readonly items: T[];
  readonly count?: number;
  constructor(items: T[], count?: number) {
    this.items = items;
    this.count = count;
  }
}

export class PaginationResultDto<T> {
  readonly items: T[];
  readonly meta: { pagination: PaginationMetaDto };

  constructor(items: T[], pagination: PaginationMetaDto) {
    this.items = items;
    this.meta = { pagination };
  }
}

export class Result {
  static toSingle<T>(data: T): SingleResultDto<T> {
    return new SingleResultDto(data);
  }

  static toList<T>(items: T[], count?: number): ListResultDto<T> {
    return new ListResultDto(items, count);
  }

  static toPagination<T>(
    items: T[],
    meta: PaginationMetaDto,
  ): PaginationResultDto<T> {
    return new PaginationResultDto(items, meta);
  }
}
