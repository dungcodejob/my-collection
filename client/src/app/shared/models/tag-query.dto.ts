import { PaginationDto } from "./pagination.dto";

export interface TagQueryDto extends PaginationDto {
  readonly collectionId?: string;
  readonly keyword: string;
}
