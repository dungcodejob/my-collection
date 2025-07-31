import { PaginationDto } from "@client/web-core-http";

export type CollectionFilter = {
  path: string;
} & PaginationDto;
