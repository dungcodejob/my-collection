import { Signal } from "@angular/core";
import { PaginationDto } from "@shared/models";

export type PaginationState = {
  pageSize: number;
  currentPage: number;
};

export type PaginationSignals = {
  $pagination: Signal<PaginationDto>;
};

export type PaginationMethods = {
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  paginationReset: () => void;
};

export type NamedPaginationState<Name extends string> = {
  [K in Name as `${K}PageSize`]: PaginationState["pageSize"];
} & { [K in Name as `${K}CurrentPage`]: PaginationState["currentPage"] };

export type NamedPaginationSignals<Name extends string> = {
  [K in Name as `$${Capitalize<K>}Pagination`]: PaginationSignals["$pagination"];
};

export type NamedPaginationMethods<ActionName extends string> = {
  [K in ActionName as `set${Capitalize<K>}CurrentPage`]: PaginationMethods["setCurrentPage"];
} & {
  [K in ActionName as `set${Capitalize<K>}PageSize`]: PaginationMethods["setPageSize"];
} & {
  [K in ActionName as `next${Capitalize<K>}Page`]: PaginationMethods["nextPage"];
} & {
  [K in ActionName as `prev${Capitalize<K>}Page`]: PaginationMethods["prevPage"];
} & {
  [K in ActionName as `pagination${Capitalize<K>}Reset`]: PaginationMethods["paginationReset"];
};
