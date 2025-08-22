import { computed, inject } from "@angular/core";
import {
  Collection,
  CollectionAdapter,
  CollectionStore,
} from "@client/web-collection-data-access";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";

type CollectionListState = {
  parentId: string | null;
  collectionDetails: Collection | null;
  isOpenDialog: boolean;
};

export const MCCollectionListFacade = signalStore(
  withState<CollectionListState>({
    collectionDetails: null,
    parentId: null,
    isOpenDialog: false,
  }),
  withComputed(
    (
      store,
      _collectionStore = inject(CollectionStore),
      _collectionAdapter = inject(CollectionAdapter)
    ) => ({
      $collections: computed(() => _collectionStore.collections()),
      $root: computed(() => _collectionStore.root()),
      $parent: computed(() => {
        const parentId = store.parentId();
        const collections = _collectionStore.collections();
        return (
          _collectionAdapter.getCollectionById(collections, parentId) ||
          _collectionStore.root()
        );
      }),
      $collectionDetails: computed(() => store.collectionDetails()),
      $isOpenDialog: computed(() => store.isOpenDialog()),
      $isListFulfilled: computed(() => _collectionStore.$isListFulfilled()),
      $listStatus: computed(() => _collectionStore.listStatus()),
      $isCreateFulfilled: computed(() => _collectionStore.$isCreateFulfilled()),
      $isUpdateFulfilled: computed(() => _collectionStore.$isUpdateFulfilled()),
    })
  ),
  withMethods((store, _collectionStore = inject(CollectionStore)) => {
    return {
      load: _collectionStore.load,
      update: _collectionStore.update,
      create: _collectionStore.create,
      openCreateDialog: (parentId: string | null): void => {
        patchState(store, { isOpenDialog: true, parentId: parentId });
      },
      openUpdateDialog: (collectionDetails: Collection): void => {
        patchState(store, {
          isOpenDialog: true,
          parentId: collectionDetails.parentId,
          collectionDetails,
        });
      },
      close: (): void => {
        patchState(store, {
          isOpenDialog: false,
          parentId: null,
          collectionDetails: null,
        });
      },
    };
  })
);
