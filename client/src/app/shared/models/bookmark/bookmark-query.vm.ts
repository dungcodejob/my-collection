import { PaginationDto } from "../pagination.dto";
import { TagVM } from "../tag/tag.vm";

export interface BookmarkQueryVM extends PaginationDto {
  readonly collectionId: string | null;
  readonly keyword: string | null;
  readonly tags: TagVM[];
}

export type BookmarkFilterVM = Omit<
  BookmarkQueryVM,
  keyof PaginationDto | "collectionId"
>;
