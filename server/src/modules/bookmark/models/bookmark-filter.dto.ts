import { PaginationParameterDto } from "@common/models";

export class BookmarkFilterDto extends PaginationParameterDto {
  collectionId?: string;
  keyword?: string;
  tagIds?: string[];
}
