import { PaginationDto } from "../pagination.dto";

export interface TagQueryDto extends PaginationDto {
  readonly collectionId: string | null;
  readonly keyword: string | null;
}

export type TagFilterDto = Omit<TagQueryDto, keyof PaginationDto | "collectionId">;
