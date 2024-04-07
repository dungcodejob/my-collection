import {
  SignalStoreFeature,
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from "@ngrx/signals";
import { SignalStoreFeatureResult } from "@ngrx/signals/src/signal-store-models";
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

export function withPagination<
  Input extends SignalStoreFeatureResult,
>(): SignalStoreFeature<
  Input,
  {
    state: PaginationState;
    signals: PaginationSignals;
    methods: PaginationMethods;
  }
>;
export function withPagination<
  Input extends SignalStoreFeatureResult,
  Name extends string,
>(config: {
  name: Name;
}): SignalStoreFeature<
  Input,
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
    withMethods(store => {
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
