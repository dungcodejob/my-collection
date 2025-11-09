import { computed, inject } from "@angular/core";
import { BookmarkStore } from "@client/web-bookmark-data-access";
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

type BookmarkListParams = {
  [PARAM_KEYS.COLLECTION_ID]: string;
};

type BookmarkListState = {
  selectedBookmarkIds: string[];
};

const initialState: BookmarkListState = {
  selectedBookmarkIds: [],
};

export const BookmarkListFacade = signalStore(
  withState(initialState),
  withProps(() => ({
    _bookmarkStore: inject(BookmarkStore),
    _collectionStore: inject(CollectionStore),
    _autoEffect: injectAutoEffect(),
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
  })),
  withMethods(({ ...store }) => ({
    onToggleSelection: (bookmarkId: string): void => {
      const selectedBookmarkIds = store.selectedBookmarkIds();
      if (selectedBookmarkIds.includes(bookmarkId)) {
        patchState(store, {
          selectedBookmarkIds: selectedBookmarkIds.filter(id => id !== bookmarkId),
        });
      } else {
        patchState(store, { selectedBookmarkIds: [...selectedBookmarkIds, bookmarkId] });
      }
      patchState(store, { selectedBookmarkIds });
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
      _autoEffect(() => {
        const { collectionId } = store.$param() as BookmarkListParams;
        _bookmarkStore.load({ collectionId });
      });
    },
  })),
  // T075: Add method to refresh bookmarks after creation
  withMethods(({ _bookmarkStore, ...store }) => ({
    refreshBookmarks: (): void => {
      const { collectionId } = store.$param() as BookmarkListParams;
      _bookmarkStore.load({ collectionId });
    },
  }))
);
