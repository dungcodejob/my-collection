import { QueryParams } from "./query.dto";

export type BookmarkField =
  | "title"
  | "description"
  | "url"
  | "isFavorite"
  | "tags"
  | "createAt"
  | "updateAt"
  | "visitCount";

export type BookmarkQueryDto = QueryParams<BookmarkField> & {
  collectionId?: string;
};
