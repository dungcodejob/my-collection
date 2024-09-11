import { BaseVM } from "../base.vm";
import { CollectionVM } from "../collection/collection.vm";
import { TagVM } from "../tag/tag.vm";
import { MetadataDto } from "./metadata.dto";

export class BookmarkVM extends BaseVM implements MetadataDto {
  url: string;
  domain: string;
  title: string;
  image: string | null;
  description: string | null;
  favicon: string | null;
  note: string | null;
  collection: CollectionVM;
  tags: TagVM[] = [];

  constructor(
    id: string,
    updateAt: string,
    createAt: string,
    collection: CollectionVM,
    tags: TagVM[],
    url: string,
    domain: string,
    title: string,
    image: string | null,
    description: string | null,
    favicon: string | null,
    note: string | null
  ) {
    super(id, updateAt, createAt);
    this.collection = collection;
    this.tags = tags;

    this.url = url;
    this.domain = domain;
    this.title = title;
    this.image = image;
    this.description = description;
    this.favicon = favicon;

    this.note = note;
  }
}

export type CreateBookmarkVM = Omit<BookmarkVM, keyof BaseVM>;
export type UpdateBookmarkVM = Omit<BookmarkVM, keyof BaseVM | "url" | "domain"> & {
  id: BaseVM["id"];
};
