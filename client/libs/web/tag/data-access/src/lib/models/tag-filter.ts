import { PaginationDto } from "@client/web-core-http";

export type TagFilter = {
  q?: string;
  collectionId: string;
} & PaginationDto;
