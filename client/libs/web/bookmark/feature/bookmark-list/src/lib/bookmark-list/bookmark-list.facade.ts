import { computed, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  BookmarkStore,
  Filter,
  FilterBuilder,
  FilterType,
  Sort,
  SortBuilder,
  SortDirection,
} from "@client/web-bookmark-data-access";
import { CollectionStore } from "@client/web-collection-data-access";
import { PARAM_KEYS } from "@client/web-shared-constants";
import { injectAutoEffect, withParam } from "@client/web-shared-utils";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";

/**
 * US1: Bookmark field types for type-safe filters and sorts
 */
type BookmarkField =
  | "title"
  | "description"
  | "url"
  | "isFavorite"
  | "tags"
  | "createAt"
  | "updateAt"
  | "visitCount";

/**
 * US2 T052: Display mode types
 */
type DisplayMode = "list" | "card" | "moodboard";

type BookmarkListParams = {
  [PARAM_KEYS.COLLECTION_ID]: string;
};

/**
 * US1 T037-T042: Extended state with URL-synchronized filters, sorts, pagination
 * US2 T052: Added displayMode for view switching
 */
type BookmarkListState = {
  selectedBookmarkIds: string[];
  filters: Filter<BookmarkField>[];
  sorts: Sort<BookmarkField>[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  displayMode: DisplayMode;
};

const initialState: BookmarkListState = {
  selectedBookmarkIds: [],
  filters: [],
  sorts: [SortBuilder.desc("createAt")], // Default sort: newest first
  page: 1,
  limit: 20,
  totalPages: 0,
  totalItems: 0,
  displayMode: "list", // US2 T052: Default display mode
};

export const BookmarkListFacade = signalStore(
  withState(initialState),
  withProps(() => ({
    _bookmarkStore: inject(BookmarkStore),
    _collectionStore: inject(CollectionStore),
    _autoEffect: injectAutoEffect(),
    _router: inject(Router),
    _route: inject(ActivatedRoute),
  })),
  withParam(),
  withComputed(({ _collectionStore, _bookmarkStore, ...store }) => ({
    $selectCollection: computed(() => _collectionStore.$selectedCollection()),

    $isListLoading: computed(() => _bookmarkStore.$isListPending()),
    $isListError: computed(() => _bookmarkStore.$listError()),
    $isListEmpty: computed(
      () => _bookmarkStore.$isListFulfilled() && _bookmarkStore.ids().length === 0
    ),

    $isHasBookmarks: computed(
      () => _bookmarkStore.$isListFulfilled() && _bookmarkStore.ids().length > 0
    ),

    $selectedIds: computed(() => store.selectedBookmarkIds()),
    $selectedCount: computed(() => store.selectedBookmarkIds().length),
    $selectedVisibleBookmarks: computed(() => {
      const ids = new Set(store.selectedBookmarkIds());
      return _bookmarkStore.entities().filter(bookmark => ids.has(bookmark.id));
    }),

    $bookmarks: computed(() => _bookmarkStore.entities()),

    // US1 T037: Computed signals for pagination
    $page: computed(() => store.page()),
    $limit: computed(() => store.limit()),
    $totalPages: computed(() => store.totalPages()),
    $totalItems: computed(() => store.totalItems()),
    $hasNextPage: computed(() => store.page() < store.totalPages()),
    $hasPreviousPage: computed(() => store.page() > 1),

    // US2 T052: Computed signal for display mode
    $displayMode: computed(() => store.displayMode()),
  })),
  withMethods(({ _router, _route, ...store }) => ({
    /**
     * US1 T037: Initialize state from URL query parameters
     * US2 T052: Parse displayMode from URL
     */
    initFromUrl(): void {
      const queryParams = _route.snapshot.queryParams;

      const filters: Filter<BookmarkField>[] = [];

      // Parse search query -> title filter
      if (queryParams["q"]) {
        filters.push(FilterBuilder.keyword("title", queryParams["q"]));
      }

      // Parse favorite filter
      if (queryParams["isFavorite"] !== undefined) {
        filters.push(
          FilterBuilder.boolean("isFavorite", queryParams["isFavorite"] === "true")
        );
      }

      // Parse sorts
      const sortParams = queryParams["sort"];
      const sorts: Sort<BookmarkField>[] = sortParams
        ? (Array.isArray(sortParams) ? sortParams : [sortParams]).map((s: string) => {
            const [field, direction] = s.split(":");
            return {
              field: field as BookmarkField,
              direction: direction as SortDirection,
            };
          })
        : [SortBuilder.desc("createAt")];

      // US2 T052: Parse display mode from URL
      const displayMode = queryParams["mode"];
      const validModes: DisplayMode[] = ["list", "card", "moodboard"];
      const parsedDisplayMode: DisplayMode = validModes.includes(displayMode)
        ? displayMode
        : "list";

      patchState(store, {
        filters,
        sorts,
        page: queryParams["page"] ? parseInt(queryParams["page"], 10) : 1,
        limit: queryParams["limit"] ? parseInt(queryParams["limit"], 10) : 20,
        displayMode: parsedDisplayMode,
      });
    },

    /**
     * US1 T041: Sync state changes to URL
     * US2 T052: Sync displayMode to URL
     */
    syncToUrl(): void {
      const queryParams: Record<string, any> = {};

      // Convert filters to URL params
      const titleFilter = store
        .filters()
        .find(f => f.field === "title" && f.type === FilterType.Keyword);
      if (titleFilter && "value" in titleFilter) {
        queryParams["q"] = titleFilter.value;
      }

      const favoriteFilter = store
        .filters()
        .find(f => f.field === "isFavorite" && f.type === FilterType.Boolean);
      if (favoriteFilter && "value" in favoriteFilter) {
        queryParams["isFavorite"] = favoriteFilter.value.toString();
      }

      // Convert sorts to URL params
      const sorts = store.sorts();
      const isDefaultSort =
        sorts.length === 1 &&
        sorts[0].field === "createAt" &&
        sorts[0].direction === SortDirection.DESC;

      if (!isDefaultSort) {
        queryParams["sort"] = sorts.map(s => `${s.field}:${s.direction}`);
      }

      // Pagination
      if (store.page() > 1) queryParams["page"] = store.page();
      if (store.limit() !== 20) queryParams["limit"] = store.limit();

      // US2 T052: Display mode (only if not default 'list')
      if (store.displayMode() !== "list") {
        queryParams["mode"] = store.displayMode();
      }

      _router.navigate([], {
        relativeTo: _route,
        queryParams,
        queryParamsHandling: "merge",
        replaceUrl: true,
      });
    },

    /**
     * US1 T038: Add filter
     */
    addFilter(filter: Filter<BookmarkField>): void {
      patchState(store, state => ({
        filters: [...state.filters, filter],
        page: 1, // Reset to page 1 when filtering
      }));
    },

    /**
     * US1 T038: Remove filter by field
     */
    removeFilter(field: BookmarkField): void {
      patchState(store, state => ({
        filters: state.filters.filter(f => f.field !== field),
        page: 1,
      }));
    },

    /**
     * US1 T039: Set page number
     */
    setPage(page: number): void {
      patchState(store, { page });
    },

    /**
     * US1 T039: Go to next page
     */
    nextPage(): void {
      if (store.page() < store.totalPages()) {
        patchState(store, state => ({ page: state.page + 1 }));
      }
    },

    /**
     * US1 T039: Go to previous page
     */
    previousPage(): void {
      if (store.page() > 1) {
        patchState(store, state => ({ page: state.page - 1 }));
      }
    },

    /**
     * US2 T052: Set display mode
     */
    setDisplayMode(mode: DisplayMode): void {
      patchState(store, { displayMode: mode });
    },

    onToggleSelection: (bookmarkId: string): void => {
      const selectedBookmarkIds = store.selectedBookmarkIds();
      if (selectedBookmarkIds.includes(bookmarkId)) {
        patchState(store, {
          selectedBookmarkIds: selectedBookmarkIds.filter(id => id !== bookmarkId),
        });
      } else {
        patchState(store, { selectedBookmarkIds: [...selectedBookmarkIds, bookmarkId] });
      }
    },

    onSelectAll: (): void => {
      patchState(store, {
        selectedBookmarkIds: store.$bookmarks().map(bookmark => bookmark.id),
      });
    },
    onClearSelection: (): void => {
      patchState(store, { selectedBookmarkIds: [] });
    },
  })),
  withHooks(({ _bookmarkStore, _autoEffect, ...store }) => ({
    onInit: (): void => {
      // US1 T037: Initialize from URL on component load
      store.initFromUrl();

      // US1 T040-T042: Auto-load bookmarks when collection, filters, sorts, or page changes
      _autoEffect(() => {
        const { collectionId } = store.$param() as BookmarkListParams;
        const page = store.page();
        const limit = store.limit();
        const filters = store.filters();
        const sorts = store.sorts();

        // Load bookmarks with current state
        _bookmarkStore.load({ collectionId, page, limit });

        // US1 T041: Sync state to URL
        store.syncToUrl();
      });
    },
  })),
  // T075: Add method to refresh bookmarks after creation
  withMethods(({ _bookmarkStore, ...store }) => ({
    refreshBookmarks(): void {
      const { collectionId } = store.$param() as BookmarkListParams;
      const page = store.page();
      const limit = store.limit();
      _bookmarkStore.load({ collectionId, page, limit });
    },
  }))
);
