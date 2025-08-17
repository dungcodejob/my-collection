import { computed, inject } from "@angular/core";
import { CollectionStore } from "@client/web-collection-data-access";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";

export const MCCollectionListFacade = signalStore(
  withState({
    isOpen: false,
  }),
  withProps(() => ({
    _collectionStore: inject(CollectionStore),
  })),
  withComputed(({ _collectionStore, isOpen }) => ({
    $collections: computed(() => _collectionStore.collections()),
    $root: computed(() => _collectionStore.root()),
    $isOpen: computed(() => isOpen()),
    $isListFulfilled: computed(() => _collectionStore.$isListFulfilled()),
    $listStatus: computed(() => _collectionStore.listStatus()),
    $isCreateFulfilled: computed(() => _collectionStore.$isCreateFulfilled()),
    $isUpdateFulfilled: computed(() => _collectionStore.$isUpdateFulfilled()),
  })),
  withMethods(store => {
    return {
      load: store._collectionStore.load,
      update: store._collectionStore.update,
      create: store._collectionStore.create,
      open: (): void => {
        patchState(store, { isOpen: true });
      },
      close: (): void => {
        patchState(store, { isOpen: false });
      },
    };
  })
);
