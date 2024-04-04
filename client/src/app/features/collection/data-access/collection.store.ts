import { inject } from "@angular/core";
import { CollectionDetailDialogComponent } from "@collection/components/collection-detail-dialog/collection-detail-dialog.component";
import { ConfirmDialogComponent } from "@collection/components/confirm-dialog/confirm-dialog.component";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { isNotFalsy, isNotNil } from "@shared/utils";
import { HlmDialogService } from "@spartan-ng/ui-dialog-helm";
import { EMPTY, catchError, filter, map, pipe, switchMap, tap } from "rxjs";
import { injectCollectionApi } from ".";

export const CollectionStore = signalStore(
  withStatus(),
  withEntities<CollectionDto>(),
  withMethods(store => {
    const collectionApi = injectCollectionApi();
    const dialogService = inject(HlmDialogService);

    const openDetailDialog = (data: CollectionDto | null) => {
      return dialogService
        .open(CollectionDetailDialogComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[30rem]",
          context: { data },
        })
        .closed$.pipe(filter(isNotNil));
    };

    const openConfirmDialog = () => {
      return dialogService
        .open(ConfirmDialogComponent, {
          closeOnBackdropClick: false,
        })
        .closed$.pipe(filter(isNotFalsy));
    };

    return {
      findAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(() =>
            collectionApi.findAll().pipe(
              tap({
                next: res => {
                  patchState(store, setEntities(res.result.items), setFulfilled());
                },
                error: err => {
                  if (err instanceof ServerSideError) {
                    patchState(store, setError(err));
                  }
                },
              }),
              catchError(() => EMPTY)
            )
          )
        )
      ),
      create: rxMethod<void>(
        pipe(
          switchMap(() =>
            openDetailDialog(null).pipe(
              tap(() => patchState(store, setPending())),
              switchMap((result: CreateCollectionDto) =>
                collectionApi.create(result).pipe(
                  tap({
                    next: res => {
                      patchState(store, addEntity(res.result.data), setFulfilled());
                    },
                    error: err => {
                      if (err instanceof ServerSideError) {
                        patchState(store, setError(err));
                      }
                    },
                  }),
                  catchError(() => EMPTY)
                )
              )
            )
          )
        )
      ),
      edit: rxMethod<string>(
        pipe(
          map(id => store.entityMap()[id]),
          switchMap(data =>
            openDetailDialog(data).pipe(
              tap(() => patchState(store, setPending())),
              switchMap((result: UpdateCollectionDto) =>
                collectionApi.update(data.id, result).pipe(
                  tap({
                    next: res => {
                      const data = res.result.data;
                      patchState(
                        store,
                        updateEntity({ id: data.id, changes: data }),
                        setFulfilled()
                      );
                    },
                    error: err => {
                      if (err instanceof ServerSideError) {
                        patchState(store, setError(err));
                      }
                    },
                  }),
                  catchError(() => EMPTY)
                )
              )
            )
          )
        )
      ),
      delete: rxMethod<string>(
        pipe(
          switchMap(id =>
            openConfirmDialog().pipe(
              tap(() => patchState(store, setPending())),
              switchMap(() =>
                collectionApi.delete(id).pipe(
                  tap({
                    next: () => {
                      patchState(store, removeEntity(id), setFulfilled());
                    },
                    error: err => {
                      if (err instanceof ServerSideError) {
                        patchState(store, setError(err));
                      }
                    },
                  }),
                  catchError(() => EMPTY)
                )
              )
            )
          )
        )
      ),
    };
  })
);
