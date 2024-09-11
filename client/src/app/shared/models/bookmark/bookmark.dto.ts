import { Type } from "class-transformer";
import { BaseDto } from "../base.dto";
import { CollectionDto } from "../collection/collection.dto";
import { TagDto } from "../tag/tag.dto";
import { MetadataDto } from "./metadata.dto";

export class BookmarkDto extends BaseDto implements MetadataDto {
  @Type(() => CollectionDto)
  collection: CollectionDto;

  @Type(() => TagDto)
  tags: TagDto[];
  note: string | null;

  url: string;
  domain: string;
  title: string;
  description: string | null;
  image: string | null;
  favicon: string | null;

  constructor(
    id: string,
    updateAt: string,
    createAt: string,
    collection: CollectionDto,
    tags: TagDto[],

    url: string,
    domain: string,
    title: string,
    description: string | null,
    image: string | null,
    favicon: string | null,

    note: string | null
  ) {
    super(id, updateAt, createAt);
    this.collection = collection;
    this.tags = tags;

    this.url = url;
    this.domain = domain;
    this.title = title;
    this.description = description;
    this.image = image;
    this.favicon = favicon;

    this.note = note;
  }
}

type BookmarkRequiredProps = Omit<BookmarkDto, keyof BaseDto | "tags" | "collection">;
export type CreateBookmarkDto = BookmarkRequiredProps & {
  collectionId: string;
  tagIds: string[];
};
export type UpdateBookmarkDto = Omit<BookmarkRequiredProps, "url" | "domain"> & {
  id: BaseDto["id"];
  tagIds: string[];
};
