import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import {
  CollectionVM,
  CreateCollectionDto,
  Identity,
  UpdateCollectionDto,
} from "@nx/web-shared-models";
import {
  clamp,
  injectParams,
  isNotNil,
  setError,
  setFulfilled,
  setPending,
  tapPrefix,
  withStatus,
} from "@nx/web-shared-utils";
import { CollectionApi } from "@nx/web-shared-api";
import { CollectionAdapter, ToastOption, ToastService } from "@nx/web-shared-services";
import { CollectionBusiness } from "./collection.business";
import { AppStore } from "./app.store";
import {
  addEntity,
  entityConfig,
  removeEntity,
  setEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { filter, finalize, map, switchMap } from "rxjs";
import { tapResponseData, tapError } from "@nx/web-shared-http";
import { CollectionMessages } from "@nx/web-shared-messages";

enum StatusName {
  List = "list",
  Detail = "detail",
}

type CollectionState = {
  toast: ToastOption | null;
};

const initialState: CollectionState = {
  toast: null,
};

export const CollectionsStore = signalStore(
  withState(initialState),
  withEntities<CollectionVM>(),
  withStatus({ name: StatusName.Detail }),
  withStatus({ name: StatusName.List }),
  withProps(() => ({
    _collectionApi: inject(CollectionApi),
    _collectionBusiness: inject(CollectionBusiness),
    _collectionAdapter: inject(CollectionAdapter),
    _toastService: inject(ToastService),
    _appStore: inject(AppStore),
  })),
  withComputed(store => {
    const $params = injectParams();
    const $items = computed(() => store.entities().sort((a, b) => a.index - b.index));
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
  withMethods(
    ({
      _collectionApi,
      _collectionBusiness,
      _collectionAdapter,
      _toastService,
      _appStore,
      ...store
    }) => {
      return {
        findByQuery: rxMethod<void>(trigger$ =>
          trigger$.pipe(
            switchMap(() =>
              _collectionApi.findAll().pipe(
                tapPrefix(() => patchState(store, setPending(StatusName.List))),
                tapResponseData(result => {
                  const items = _collectionAdapter.toItemVM(result.items);
                  patchState(store, setEntities(items), setFulfilled(StatusName.List));
                }),
                tapError(error => {
                  patchState(store, setError(error, StatusName.List));
                })
              )
            )
          )
        ),
        create: rxMethod<CreateCollectionDto>(collectionToCreate$ =>
          collectionToCreate$.pipe(
            switchMap(collectionToCreate =>
              _collectionApi.create(collectionToCreate).pipe(
                tapPrefix(() => patchState(store, setPending(StatusName.Detail))),
                tapResponseData(result => {
                  const data = _collectionAdapter.toItemVM(result.data);
                  const toast: ToastOption = {
                    type: "success",
                    message: CollectionMessages.CreateSuccess,
                    data: { params: [data.title] },
                  };

                  patchState(
                    store,
                    { toast },
                    addEntity(data),
                    setFulfilled(StatusName.Detail)
                  );
                }),
                tapError(error => {
                  const toast: ToastOption = {
                    type: "error",
                    message: CollectionMessages.CreateFailure,
                  };

                  patchState(store, { toast }, setError(error, StatusName.Detail));
                })
              )
            )
          )
        ),
        update: rxMethod<UpdateCollectionDto>(collectionToUpdate$ =>
          collectionToUpdate$.pipe(
            switchMap(collectionToUpdate =>
              _collectionApi.update(collectionToUpdate.id, collectionToUpdate).pipe(
                tapPrefix(() => patchState(store, setPending(StatusName.Detail))),
                tapResponseData(result => {
                  const data = _collectionAdapter.toItemVM(result.data);

                  const toast: ToastOption = {
                    type: "success",
                    message: CollectionMessages.UpdateSuccess,
                    data: { params: [data.title] },
                  };

                  patchState(
                    store,
                    { toast },
                    updateEntity({ id: data.id, changes: data }),
                    setFulfilled(StatusName.Detail)
                  );
                }),
                tapError(error => {
                  const toast: ToastOption = {
                    type: "error",
                    message: CollectionMessages.UpdateFailure,
                  };

                  patchState(store, { toast }, setError(error, StatusName.Detail));
                })
              )
            )
          )
        ),
        delete: rxMethod<Identity>(id$ =>
          id$.pipe(
            map(id => store.entities().find(item => item.id === id)),
            filter(isNotNil),
            switchMap(itemToDelete =>
              _collectionApi.delete(itemToDelete.id).pipe(
                tapPrefix(() => {
                  _appStore.setLoading(true);
                  setPending(StatusName.Detail);
                }),
                tapResponseData(() => {
                  const toast: ToastOption = {
                    type: "success",
                    message: CollectionMessages.DeleteSuccess,
                    data: { params: [itemToDelete.title] },
                  };

                  patchState(
                    store,
                    { toast },
                    removeEntity(itemToDelete.id),
                    setFulfilled(StatusName.Detail)
                  );
                }),
                tapError(error => {
                  const toast: ToastOption = {
                    type: "error",
                    message: CollectionMessages.DeleteFailure,
                  };
                  patchState(store, { toast }, setError(error, StatusName.Detail));
                }),
                finalize(() => _appStore.setLoading(false))
              )
            )
          )
        ),
        move: rxMethod<{ fromIndex: number; toIndex: number }>(id$ =>
          id$.pipe(
            switchMap(({ fromIndex, toIndex }) => {
              const items = store.entities();
              const movedItem = items.find((_, index) => index === fromIndex);
              if (!movedItem) throw new Error("Item not found");

              const positions = _collectionBusiness.getPositionFromIndex(
                items,
                fromIndex,
                toIndex
              );
              return _collectionApi
                .move(movedItem.id, {
                  prevPosition: positions[0],
                  nextPosition: positions[1],
                })
                .pipe(
                  tapPrefix(() =>
                    patchState(
                      store,
                      setEntities(_collectionBusiness.move(items, fromIndex, toIndex)),
                      setPending(StatusName.Detail)
                    )
                  ),
                  tapResponseData(() =>
                    patchState(store, setFulfilled(StatusName.Detail))
                  ),
                  tapError(error =>
                    patchState(
                      store,
                      setEntities(_collectionBusiness.move(items, toIndex, fromIndex)),
                      setError(error, StatusName.Detail)
                    )
                  )
                );
            })
          )
        ),
      };
    }
  )
);
