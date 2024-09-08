import { BaseDto } from "../base.dto";
import { TagDto } from "../tag/tag.dto";
import { MetadataDto } from "./metadata.dto";

export interface BookmarkDto extends BaseDto, MetadataDto {
  note: string | null;
  collectionId: string;
  tags: TagDto[];
}

type BookmarkRequiredProps = Omit<BookmarkDto, keyof BaseDto | "tags">;
export type CreateBookmarkDto = BookmarkRequiredProps & {
  tagIds: string[];
};
export type UpdateBookmarkDto = Omit<BookmarkRequiredProps, "url" | "domain"> & {
  id: BaseDto["id"];
  tagIds: string[];
};
