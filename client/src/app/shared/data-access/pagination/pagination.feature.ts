import { Signal, computed } from "@angular/core";
import {
  SignalStoreFeature,
  WritableStateSource,
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { EmptyFeatureResult } from "@ngrx/signals/src/signal-store-models";
import {
  NamedPaginationMethods,
  NamedPaginationSignals,
  NamedPaginationState,
  PaginationMeta,
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

const initialState: PaginationMeta = {
  currentPage: CURRENT_PAGE,
  pageSize: PAGE_SIZE,
  totalCount: 0,
};

export function withPagination(): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: PaginationState;
    computed: PaginationSignals;
    methods: PaginationMethods;
  }
>;
export function withPagination<Name extends string>(config: {
  name: Name;
}): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: NamedPaginationState<Name>;
    computed: NamedPaginationSignals<Name>;
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
      [paginationKey]: initialState,
    }),
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $pagination = store[paginationKey] as Signal<PaginationMeta>;

      return {
        ...store,
        [paginationKey]: computed(() => {
          const pagination = $pagination();
          const totalPages = Math.round(pagination.totalCount / pagination.pageSize);
          return {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalCount: pagination.totalCount,
            totalPages: totalPages,
            hasPrevious: pagination.currentPage > 1,
            hasNext: pagination.currentPage < totalPages,
          };
        }),
      };
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withMethods((store: Record<string, Signal<unknown>>) => {
      const pagination = store[paginationKey] as Signal<PaginationMeta>;
      return {
        [resetKey]: () => {
          patchState(store as WritableStateSource<object>, {
            [paginationKey]: initialState,
          });
        },
        [setCurrentPageKey]: (currentPage: number) => {
          patchState(store as WritableStateSource<object>, {
            [paginationKey]: {
              ...pagination(),
              currentPage: currentPage,
            },
          });
        },
        [setPageSizeKey]: (pageSize: number) => {
          patchState(store as WritableStateSource<object>, {
            [paginationKey]: {
              ...pagination(),
              pageSize: pageSize,
            },
          });
        },
        [nextPageKey]: () => {
          const currentPage = pagination().currentPage;
          patchState(store as WritableStateSource<object>, {
            [paginationKey]: {
              ...pagination(),
              currentPage: currentPage + 1,
            },
          });
        },
        [prevPageKey]: () => {
          const currentPage = pagination().currentPage;
          patchState(store as WritableStateSource<object>, {
            [paginationKey]: {
              ...pagination(),
              currentPage: currentPage - 1,
            },
          });
        },
      };
    })
  );
}
