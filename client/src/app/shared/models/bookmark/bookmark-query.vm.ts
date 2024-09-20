import { PaginationDto } from "../pagination.dto";
import { TagVM } from "../tag/tag.vm";

export class BookmarkQueryVM extends PaginationDto {
  readonly collectionId: string | null;
  readonly keyword: string | null;
  readonly tags: TagVM[];

  constructor(collectionId: string | null, keyword: string | null, tags: TagVM[]) {
    super();
    this.collectionId = collectionId;
    this.keyword = keyword;
    this.tags = tags;
  }
}

export type BookmarkFilterVM = Omit<
  BookmarkQueryVM,
  keyof PaginationDto | "collectionId"
>;
