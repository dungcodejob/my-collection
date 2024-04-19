import { PaginationDto } from "../pagination.dto";

export interface TagQueryDto extends PaginationDto {
  readonly collectionId?: string;
  readonly keyword?: string;
}

export type TagFilterDto = Omit<TagQueryDto, keyof PaginationDto>;
