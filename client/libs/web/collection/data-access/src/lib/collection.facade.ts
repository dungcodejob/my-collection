import { inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { CollectionApi } from "@nx/web-shared-api";
import { tapError, tapResponseData } from "@nx/web-shared-http";
import { CollectionMessages } from "@nx/web-shared-messages";
import {
  CreateCollectionDto,
  Identity,
  UpdateCollectionDto,
} from "@nx/web-shared-models";
import { CollectionAdapter, ToastService } from "@nx/web-shared-services";
import { AppStore, CollectionBusiness, CollectionStore } from "@nx/web-shared-store";
import {
  isNotNil,
  setError,
  setFulfilled,
  setPending,
  tapPrefix,
  withStatus,
} from "@nx/web-shared-utils";
import { filter, finalize, map, switchMap } from "rxjs";

enum StatusName {
  List = "list",
  Detail = "detail",
}

export const CollectionFacade = signalStore(
  withStatus({ name: StatusName.List }),
  withStatus({ name: StatusName.Detail }),
  withProps(() => ({
    _toastService: inject(ToastService),
  })),
  withComputed(({ _collectionStore }) => ({
    $items: _collectionStore.$items,
    $selectedId: _collectionStore.$selectedId,
  })),
  withMethods(
    ({
      _collectionApi,
      _collectionStore,
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

                  _collectionStore.setItems(items);
                  // _toastService.success(CollectionMessages.CreateSuccess, {
                  //   params: [data.title],
                  // });

                  patchState(store, setFulfilled(StatusName.List));
                }),
                tapError(error => {
                  _toastService.error(CollectionMessages.CreateFailure);
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

        update: rxMethod<UpdateCollectionDto>(collectionToUpdate$ =>
          collectionToUpdate$.pipe(
            switchMap(collectionToUpdate =>
              _collectionApi.update(collectionToUpdate.id, collectionToUpdate).pipe(
                tapPrefix(() => patchState(store, setPending(StatusName.Detail))),
                tapResponseData(result => {
                  const data = _collectionAdapter.toItemVM(result.data);

                  _collectionStore.updateItem(data.id, data);
                  _toastService.success(CollectionMessages.UpdateSuccess, {
                    params: [data.title],
                  });

                  patchState(store, setFulfilled(StatusName.Detail));
                }),
                tapError(error => {
                  _toastService.error(CollectionMessages.UpdateFailure);
                  patchState(store, setError(error, StatusName.Detail));
                })
              )
            )
          )
        ),
        delete: rxMethod<Identity>(id$ =>
          id$.pipe(
            map(id => _collectionStore.$items().find(item => item.id === id)),
            filter(isNotNil),
            switchMap(itemToDelete =>
              _collectionApi.delete(itemToDelete.id).pipe(
                tapPrefix(() => _appStore.setLoading(true)),
                tapResponseData(() => {
                  _collectionStore.deleteItem(itemToDelete.id);
                  _toastService.success(CollectionMessages.DeleteSuccess, {
                    params: [itemToDelete.title],
                  });
                }),
                tapError(error => {
                  _toastService.error(CollectionMessages.DeleteFailure);
                }),
                finalize(() => _appStore.setLoading(false))
              )
            )
          )
        ),
        move: rxMethod<{ fromIndex: number; toIndex: number }>(id$ =>
          id$.pipe(
            switchMap(({ fromIndex, toIndex }) => {
              const items = _collectionStore.items();
              const movedItem = items.find((_, index) => index === fromIndex);
              if (!movedItem) throw new Error("Item not found");

              const [prevPosition, nextPosition] =
                _collectionBusiness.getPositionFromIndex(items, fromIndex, toIndex);
              _collectionStore.move(fromIndex, toIndex);
              return _collectionApi
                .move(movedItem.id, { prevPosition, nextPosition })
                .pipe(
                  tapError(() => {
                    _collectionStore.move(toIndex, fromIndex);
                  })
                );
            })
          )
        ),
      };
    }
  )
);
