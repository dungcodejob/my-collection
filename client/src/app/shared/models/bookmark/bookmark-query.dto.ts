import { Expose, Transform } from "class-transformer";
import { PaginationDto } from "../pagination.dto";

export class BookmarkQueryDto extends PaginationDto {
  readonly keyword: string | null;

  @Expose({ name: "collection" })
  @Transform(({ obj }) => String(obj["id"]), { toClassOnly: true })
  readonly collectionId: string | null;

  @Expose({ name: "tags" })
  @Transform(({ obj }) => String(obj["id"]), { toClassOnly: true })
  readonly tagIds: string[];

  constructor(collectionId: string | null, keyword: string | null, tagIds: string[]) {
    super();
    this.collectionId = collectionId;
    this.keyword = keyword;
    this.tagIds = tagIds;
  }
}

export type BookmarkFilterDto = Omit<
  BookmarkQueryDto,
  keyof PaginationDto | "collectionId"
>;
