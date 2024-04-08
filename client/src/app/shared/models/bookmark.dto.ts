import { BaseDto } from "./base.dto";

export interface BookmarkDto extends BaseDto {
  url: string;
  domain: string;
  title: string;
  image: string;
  description: string | null;
  favicon: string;
  note: string;
  collectionId: string;
}

export type BookmarkRequiredProps = Omit<BookmarkDto, keyof BaseDto>;
export type CreateBookmarkDto = BookmarkRequiredProps;
export type UpdateBookmarkDto = Omit<BookmarkRequiredProps, "url" | "domain">;
