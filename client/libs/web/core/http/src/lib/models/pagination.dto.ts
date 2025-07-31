export type PaginationDto = {
  readonly currentPage: number;
  readonly pageSize: number;
};

export type PaginationMetaDto = {
  readonly totalPages: number;
  readonly totalCount: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
} & PaginationDto;
