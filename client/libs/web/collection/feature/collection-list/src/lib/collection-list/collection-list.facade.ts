import { computed, inject } from "@angular/core";
import { CollectionStore, collectionEvents } from "@client/web-collection-data-access";
import { signalStore, withComputed, withMethods, withProps } from "@ngrx/signals";
import { injectDispatch } from "@ngrx/signals/events";

export const MCCollectionListFacade = signalStore(
  withProps(() => ({
    _collectionStore: inject(CollectionStore),
    _dispatch: injectDispatch(collectionEvents),
  })),
  withComputed(({ _collectionStore }) => ({
    $isPending: computed(() => _collectionStore.$isListPending()),
    $isFulfilled: computed(() => _collectionStore.$isListFulfilled()),
    $error: computed(() => _collectionStore.$listError()),
    $collections: computed(() => _collectionStore.collections()),
    $root: computed(() => _collectionStore.root()),
  })),
  withMethods(({ _collectionStore, _dispatch }) => ({
    load: _dispatch.load,
    update: _dispatch.update,
    delete: _dispatch.delete,
    create: _dispatch.create,
    reset: _dispatch.reset,
  }))
);
