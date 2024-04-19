import { PaginationDto } from "../pagination.dto";

export interface BookmarkQueryDto extends PaginationDto {
  readonly collectionId?: string;
  readonly keyword: string;
}
