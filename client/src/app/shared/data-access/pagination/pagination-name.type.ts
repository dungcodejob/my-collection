import { Signal } from "@angular/core";
import {
  MethodsDictionary,
  SignalsDictionary,
} from "@ngrx/signals/src/signal-store-models";

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

interface PaginationViewAttributes {
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type PaginationVM = PaginationMeta & PaginationViewAttributes;

export interface PaginationState {
  pagination: PaginationMeta;
}

export interface PaginationSignals extends SignalsDictionary {
  $pagination: Signal<PaginationVM>;
}

export interface PaginationMethods extends MethodsDictionary {
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  paginationReset: () => void;
}

export type NamedPaginationState<Name extends string> = {
  [K in Name as `${K}Pagination`]: PaginationMeta;
};

export type NamedPaginationSignals<Name extends string> = {
  [K in Name as `$${Capitalize<K>}Pagination`]: Signal<PaginationVM>;
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
