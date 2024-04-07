import { BaseDto } from "./base.dto";

export class BookmarkDto extends BaseDto {
  url: string;
  domain: string;
  title: string;
  image: string;
  description: string | null;
  favicon: string;
  note: string;
  collectionId: string;

  private constructor(data: BookmarkDto) {
    super(data);
    this.url = data.url;
    this.title = data.title;
    this.domain = data.domain;
    this.image = data.image;
    this.description = data.description;
    this.favicon = data.favicon;
    this.note = data.note;
    this.collectionId = data.collectionId;
  }
}

export type BookmarkRequiredProps = Omit<BookmarkDto, keyof BaseDto>;
export type CreateBookmarkDto = BookmarkRequiredProps;
export type UpdateBookmarkDto = Omit<BookmarkRequiredProps, "url" | "domain">;
