export type PaginationMetaDto = {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalCount: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
};
