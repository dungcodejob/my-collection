import { Signal } from "@angular/core";

export type PaginationState = {
  pageSize: number;
  currentPage: number;
};

export type PaginationSignals = {
  pageSize: Signal<number>;
  currentPage: Signal<number>;
};

export type PaginationMethods = {
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  paginationReset: () => void;
};

export type NamedPaginationState<Name extends string> = {
  [K in Name as `${K}PageSize`]: number;
} & { [K in Name as `${K}CurrentPage`]: number };

export type NamedPaginationSignals<Name extends string> = {
  [K in Name as `${Capitalize<K>}PageSize`]: Signal<number>;
} & {
  [K in Name as `is${Capitalize<K>}CurrentPage`]: Signal<number>;
};

export type NamedPaginationMethods<ActionName extends string> = {
  [K in ActionName as `set${Capitalize<K>}CurrentPage`]: (currentPage: number) => void;
} & {
  [K in ActionName as `set${Capitalize<K>}PageSize`]: (pageSize: number) => void;
} & {
  [K in ActionName as `next${Capitalize<K>}Page`]: () => void;
} & {
  [K in ActionName as `prev${Capitalize<K>}Page`]: () => void;
} & {
  [K in ActionName as `pagination${Capitalize<K>}Reset`]: () => void;
};
