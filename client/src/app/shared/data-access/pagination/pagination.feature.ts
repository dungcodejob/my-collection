import { Signal, computed } from "@angular/core";
import {
  SignalStoreFeature,
  StateSignal,
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  EmptyFeatureResult
} from "@ngrx/signals/src/signal-store-models";
import { PaginationDto } from "@shared/models";
import {
  NamedPaginationMethods,
  NamedPaginationSignals,
  NamedPaginationState,
  PaginationMethods,
  PaginationSignals,
  PaginationState,
} from "./pagination-name.type";

const CURRENT_PAGE = 1;
const PAGE_SIZE = 10;

function capitalize(str: string): string {
  return str.length > 1 ? str[0].toUpperCase() + str.substring(1) : str.toUpperCase();
}

function getPaginationStateKeys(config?: { name: string }) {
  const name = config?.name;
  return {
    paginationKey: name ? `$${name}Pagination` : "$pagination",
    currentPageKey: name ? `${name}CurrentPage` : "currentPage",
    pageSizeKey: name ? `${name}PageSize` : "pageSize",
    setCurrentPageKey: name ? `set${capitalize(name)}CurrentPage` : "setCurrentPage",
    setPageSizeKey: name ? `set${capitalize(name)}PageSize` : "setPageSize",
    nextPageKey: name ? `next${capitalize(name)}Page` : "nextPage",
    prevPageKey: name ? `prev${capitalize(name)}Page` : "prevPage",
    resetKey: name ? `pagination${capitalize(name)}Reset` : "paginationReset",
  };
}

const initialState: PaginationDto = { currentPage: CURRENT_PAGE, pageSize: PAGE_SIZE };

export function withPagination(): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: PaginationState;
    signals: PaginationSignals;
    methods: PaginationMethods;
  }
>;
export function withPagination<Name extends string>(config: {
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: NamedPaginationState<Name>;
    signals: NamedPaginationSignals<Name>;
    methods: NamedPaginationMethods<Name>;
  }
>;

export function withPagination<Name extends string>(config?: {
  name: Name;
}): SignalStoreFeature {
  const {
    paginationKey,
    currentPageKey,
    pageSizeKey,
    setCurrentPageKey,
    setPageSizeKey,
    nextPageKey,
    prevPageKey,
    resetKey,
  } = getPaginationStateKeys(config);

  return signalStoreFeature(
    withState({
      [currentPageKey]: initialState.currentPage,
      [pageSizeKey]: initialState.pageSize,
    }),
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $currentPage = store[currentPageKey] as Signal<number>;
      const $pageSize = store[pageSizeKey] as Signal<number>;
      return {
        ...store,
        [paginationKey]: computed(() => ({
          currentPage: $currentPage(),
          pageSize: $pageSize(),
        })),
      };
    }),
    withMethods((store: StateSignal<any>) => {
      return {
        [resetKey]: () =>
          patchState(store, {
            [currentPageKey]: initialState.currentPage,
            [pageSizeKey]: initialState.pageSize,
          }),
        [setCurrentPageKey]: (currentPage: number) =>
          patchState(store, state => ({ ...state, [currentPageKey]: currentPage })),
        [setPageSizeKey]: (pageSize: number) =>
          patchState(store, state => ({ ...state, [pageSizeKey]: pageSize })),
        [nextPageKey]: () =>
          patchState(store, state => ({
            ...state,
            [currentPageKey]: state[currentPageKey] + 1,
          })),
        [prevPageKey]: () =>
          patchState(store, state => ({
            ...state,
            [currentPageKey]: state[currentPageKey] - 1,
          })),
      };
    })
  );
}
