import { PaginationParameterDto } from "@common/models";

export class BookmarkFilterDto extends PaginationParameterDto {
  collectionId?: string;
  // tagIds?: string;
}
