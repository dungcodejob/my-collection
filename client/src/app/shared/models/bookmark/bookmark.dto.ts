import { BaseDto } from "../base.dto";
import { MetadataDto } from "./metadata.dto";

export interface BookmarkDto extends BaseDto, MetadataDto {
  note: string;
  collectionId: string;
}

export type BookmarkRequiredProps = Omit<BookmarkDto, keyof BaseDto>;
export type CreateBookmarkDto = BookmarkRequiredProps;
export type UpdateBookmarkDto = Omit<BookmarkRequiredProps, "url" | "domain">;
