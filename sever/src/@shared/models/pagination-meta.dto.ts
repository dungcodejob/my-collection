import { PaginationParameterDto } from './pagination-parameter.dto';

export class PaginationMetaDto {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalCount: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;

  constructor(data: { parameter: PaginationParameterDto; total: number }) {
    this.currentPage = data.parameter.currentPage;
    this.pageSize = data.parameter.pageSize;
    this.totalPages = Math.ceil(data.total / data.parameter.pageSize);
    this.totalCount = data.total;
    this.hasPrevious = this.currentPage > 1;
    this.hasNext = this.currentPage < this.totalPages;
  }
}
