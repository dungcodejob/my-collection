import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { CollectionVM, CreateCollectionDto, Identity } from "@nx/web-shared-models";
import { clamp, injectParams, isNotNil } from "@nx/web-shared-utils";
import { CollectionApi } from "@nx/web-shared-api";
import { CollectionAdapter, ToastService } from "@nx/web-shared-services";
import { CollectionBusiness } from "./collection.business";
import { AppStore } from "./app.store";
import {
  addEntity,
  entityConfig,
  removeEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { switchMap } from "rxjs";

type CollectionState = {
  items: CollectionVM[];
};

const initialState: CollectionState = {
  items: [],
};

export const CollectionsStore = signalStore(
  withState(initialState),
  withEntities<CollectionVM>(),
  withProps(() => ({
    _collectionApi: inject(CollectionApi),
    _collectionBusiness: inject(CollectionBusiness),
    _collectionAdapter: inject(CollectionAdapter),
    _toastService: inject(ToastService),
    _appStore: inject(AppStore),
  })),
  withComputed(store => {
    const $params = injectParams();
    const $items = computed(() => store.items());
    const $selectedId = computed(() => $params()["id"] as Identity | null);
    const $selectedEntity = computed(() => {
      const selectedId = $selectedId();
      return $items().find(item => item.id === selectedId);
    });
    return {
      $items,
      $selectedId,
      $selectedEntity,
    };
  }),
  withMethods(({ ...store }) => {
    return {
      setItems: (items: CollectionVM[]) => {
        patchState(store, { items });
      },
      create: rxMethod<CreateCollectionDto>(collectionToCreate$ =>
        collectionToCreate$.pipe(
          switchMap(collectionToCreate =>
            _collectionApi.create(collectionToCreate).pipe(
              tapPrefix(() => patchState(store, setPending(StatusName.Detail))),
              tapResponseData(result => {
                const data = _collectionAdapter.toItemVM(result.data);
                _collectionStore.addItem(data);
                _toastService.success(CollectionMessages.CreateSuccess, {
                  params: [data.title],
                });

                patchState(store, setFulfilled(StatusName.Detail));
              }),
              tapError(error => {
                // _toastService.error(CollectionMessages.CreateFailure);
                patchState(store, setError(error, StatusName.Detail));
              })
            )
          )
        )
      ),
      addItem: (itemToAdd: CollectionVM) => {
        const newItems = [...store.items(), itemToAdd];
        patchState(store, { items: newItems });
      },
      updateItem: (id: Identity, itemToUpdate: Partial<CollectionVM>) => {
        if (!id) {
          throw new Error(`Id cannot be null or undefined`);
        }

        if (!itemToUpdate) {
          throw new Error(`Updated item cannot be null or undefined`);
        }

        const newItems = store.items().map(item => {
          if (item.id === id) {
            return { ...item, ...itemToUpdate };
          }
          return item;
        });
        console.log("newItems", newItems);
        patchState(store, { items: newItems });
      },
      deleteItem: (id: Identity) => {
        const newItems = store.items().filter(item => item.id !== id);
        patchState(store, { items: newItems });
      },
      move: (fromIndex: number, toIndex: number) => {
        if (!isNotNil(fromIndex) || !isNotNil(toIndex)) {
          throw new Error(`Index cannot be null or undefined`);
        }

        const newEntities = [...store.items()];
        const from = clamp(fromIndex, newEntities.length - 1);
        const to = clamp(toIndex, newEntities.length - 1);

        if (from === to) {
          return;
        }

        const target = newEntities[from];
        const delta = to < from ? -1 : 1;

        for (let i = from; i !== to; i += delta) {
          newEntities[i] = newEntities[i + delta];
        }

        newEntities[to] = target;

        patchState(store, { items: newEntities });
      },
    };
  })
);
