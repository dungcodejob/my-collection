import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
} from "@ngrx/signals";
import {
  addEntities,
  addEntity,
  entityConfig,
  removeEntity,
  setEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { CollectionApi } from "@nx/web-shared-api";
import { tapError, tapResponseFailed, tapResponseSuccess } from "@nx/web-shared-http";
import { CollectionMessages } from "@nx/web-shared-messages";
import {
  CollectionVM,
  CreateCollectionDto,
  UpdateCollectionDto,
} from "@nx/web-shared-models";
import { ToastService } from "@nx/web-shared-services";
import {
  isNotNil,
  setError,
  setFulfilled,
  setPending,
  tapPrefix,
  withStatus,
} from "@nx/web-shared-utils";
import { plainToInstance } from "class-transformer";
import { filter, map, of, pipe, switchMap, tap } from "rxjs";
import { CollectionBusiness } from "./collection.business";

export const CollectionStore = signalStore(
  withEntities<CollectionVM>(),
  withStatus(),
  withProps(() => ({
    _collectionApi: inject(CollectionApi),
    _collectionBusiness: inject(CollectionBusiness),
    _toastService: inject(ToastService),
  })),
  withComputed(store => ({
    $entities: computed(() => store.entities().sort(item => item.index)),
  })),
  withMethods(({ _collectionApi, _collectionBusiness, _toastService, ...store }) => {
    return {
      findByQuery: rxMethod<void>(
        pipe(
          switchMap(() =>
            _collectionApi.findAll().pipe(
              tapPrefix(() => patchState(store, setPending())),
              tapResponseSuccess(result => {
                const items = plainToInstance(CollectionVM, result.items);
                patchState(store, addEntities(items), setFulfilled());
              }),
              tapResponseFailed(res => {
                const error = new Error(res.message);
                patchState(store, setError(error));
              }),
              tapError()
            )
          )
        )
      ),
      create: rxMethod<CreateCollectionDto>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(result =>
            _collectionApi.create(result).pipe(
              tapPrefix(() => patchState(store, setPending())),
              tapResponseSuccess(result => {
                const data = plainToInstance(CollectionVM, result.data);
                patchState(store, addEntity(data), setFulfilled());
                _toastService.success(CollectionMessages.CreateSuccess, {
                  params: [data.title],
                });
              }),
              tapResponseFailed(res => {
                const error = new Error(res.message);
                patchState(store, setError(error));

                _toastService.error(CollectionMessages.CreateFailure);
              }),
              tapError()
            )
          )
        )
      ),
      update: rxMethod<UpdateCollectionDto>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(dto =>
            _collectionApi.update(dto.id, dto).pipe(
              tapPrefix(() => patchState(store, setPending())),
              tapResponseSuccess(result => {
                const data = plainToInstance(CollectionVM, result.data);
                patchState(
                  store,
                  updateEntity({
                    id: data.id,
                    changes: data,
                  }),
                  setFulfilled()
                );
                _toastService.success(CollectionMessages.UpdateSuccess, {
                  params: [data.title],
                });
              }),
              tapResponseFailed(res => {
                const error = new Error(res.message);
                patchState(store, setError(error));

                const errorCode = res.errorCode as keyof typeof CollectionMessages;
                const message =
                  CollectionMessages[errorCode] ?? CollectionMessages.UpdateFailure;
                _toastService.error(message);
              }),
              tapError()
            )
          )
        )
      ),

      delete: rxMethod<string>(
        pipe(
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          switchMap(data =>
            _collectionApi.delete(data.id).pipe(
              tapPrefix(() => patchState(store, setPending())),
              tapResponseSuccess(() => {
                patchState(store, removeEntity(data.id));
                _toastService.success(CollectionMessages.DeleteSuccess, {
                  params: [data.title],
                });
              }),
              tapResponseFailed(res => {
                const error = new Error(res.message);
                patchState(store, setError(error));

                const errorCode = res.errorCode as keyof typeof CollectionMessages;
                const message =
                  CollectionMessages[errorCode] ?? CollectionMessages.DeleteFailure;
                _toastService.error(message, {
                  params: [data.title],
                });
              }),
              tapError()
            )
          )
        )
      ),

      move: rxMethod<{ fromIndex: number; toIndex: number }>(
        pipe(
          switchMap(({ fromIndex, toIndex }) => {
            const entities = store.entities();
            const movedEntity = entities[fromIndex];

            if (!movedEntity || entities.length === 0) {
              return of();
            }

            const [prevPosition, nextPosition] = _collectionBusiness.getPositionFromIndex(
              entities,
              fromIndex,
              toIndex
            );

            return _collectionApi
              .move(movedEntity.id, {
                prevPosition,
                nextPosition,
              })
              .pipe(
                tapPrefix(() => {
                  const newEntities = _collectionBusiness.move(
                    entities,
                    fromIndex,
                    toIndex
                  );
                  patchState(store, setEntities(newEntities));
                }),

                tapResponseSuccess(result => {
                  const data = plainToInstance(CollectionVM, result.data);
                  patchState(
                    store,
                    updateEntity({
                      id: data.id,
                      changes: data,
                    }),
                    setFulfilled()
                  );
                }),
                tapResponseFailed(res => {
                  const error = new Error(res.message);
                  const newEntities = _collectionBusiness.move(
                    entities,
                    fromIndex,
                    toIndex
                  );

                  patchState(store, setEntities(newEntities), setError(error));
                }),
                tapError(),
              );
          })
        )
      ),
    };
  })
);
