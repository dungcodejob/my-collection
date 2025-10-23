import { computed, inject } from "@angular/core";
import { BookmarkStore } from "@client/web-bookmark-data-access";
import { CollectionStore } from "@client/web-collection-data-access";
import { PARAM_KEYS } from "@client/web-shared-constants";
import { injectAutoEffect, withParam } from "@client/web-shared-utils";
import { signalStore, withComputed, withHooks, withProps } from "@ngrx/signals";

type BookmarkListParams = {
  [PARAM_KEYS.COLLECTION_ID]: string;
};

export const BookmarkListFacade = signalStore(
  withProps(() => ({
    _bookmarkStore: inject(BookmarkStore),
    _collectionStore: inject(CollectionStore),
    _autoEffect: injectAutoEffect(),
  })),
  withParam(),
  withComputed(({ _bookmarkStore, _collectionStore, _autoEffect, ...store }) => ({
    $selectCollection: computed(() => _collectionStore.$selectedCollection()),
  })),
  withHooks(({ _bookmarkStore, _autoEffect, ...store }) => ({
    onInit: (): void => {
      _autoEffect(() => {
        const { collectionId } = store.$param() as BookmarkListParams;
        _bookmarkStore.load({ collectionId });
      });
    },
  }))
);
