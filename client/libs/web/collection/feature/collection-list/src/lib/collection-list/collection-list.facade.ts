import { computed, inject } from "@angular/core";
import { CollectionStore, collectionEvents } from "@client/web-collection-data-access";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { injectDispatch } from "@ngrx/signals/events";

export const MCCollectionListFacade = signalStore(
  withState({
    isOpen: false,
  }),
  withProps(() => ({
    _collectionStore: inject(CollectionStore),
    _dispatch: injectDispatch(collectionEvents),
  })),
  withComputed(({ _collectionStore, isOpen }) => ({
    $collections: computed(() => _collectionStore.collections()),
    $root: computed(() => _collectionStore.root()),
    $isOpen: computed(() => isOpen()),
  })),
  withMethods(store => {
    const { _dispatch } = store;
    return {
      load: _dispatch.load,
      open: (): void => {
        patchState(store, { isOpen: true });
      },
      close: (): void => {
        patchState(store, { isOpen: false });
      },
      update: _dispatch.update,
      delete: _dispatch.delete,
      create: _dispatch.create,
      reset: _dispatch.reset,
    };
  })
);
