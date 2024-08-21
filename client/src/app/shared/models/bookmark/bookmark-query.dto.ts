import { PaginationDto } from "../pagination.dto";

export interface BookmarkQueryDto extends PaginationDto {
  readonly collectionId: string | null;
  readonly keyword: string | null;
}

export type BookmarkFilterDto = Omit<
  BookmarkQueryDto,
  keyof PaginationDto | "collectionId"
>;
