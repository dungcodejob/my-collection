import { computed, inject } from "@angular/core";
import { CollectionDetailDialogComponent } from "@collection/components/collection-detail-dialog/collection-detail-dialog.component";
import { ConfirmDialogComponent } from "@collection/components/confirm-dialog/confirm-dialog.component";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withComputed, withMethods } from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { CollectionMessage } from "@shared/enums";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { ToastService } from "@shared/services";
import { isNotFalsy, isNotNil } from "@shared/utils";
import { HlmDialogService } from "@spartan-ng/ui-dialog-helm";
import { EMPTY, catchError, filter, map, pipe, switchMap, tap } from "rxjs";
import { injectCollectionApi } from ".";

export const CollectionStore = signalStore(
  withStatus(),
  withEntities<CollectionDto>(),
  withComputed(store => ({
    $entities: computed(() =>
      store
        .entities()
        .sort(
          (entityOne, entityTwo) =>
            entityTwo.createAt.getTime() - entityOne.createAt.getTime()
        )
    ),
  })),
  withMethods(store => {
    const collectionApi = injectCollectionApi();
    const dialogService = inject(HlmDialogService);
    const toastService = inject(ToastService);

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
                  patchState(
                    store,
                    setEntities(CollectionDto.from(res.result.items)),
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
                      const data = res.result.data;
                      patchState(
                        store,
                        addEntity(CollectionDto.from(data)),
                        setFulfilled()
                      );
                      toastService.success(`Collection “${data.title}“ was created`);
                    },
                    error: err => {
                      const message = "Collection could not be created";
                      if (err instanceof ServerSideError) {
                      }

                      patchState(store, setError(err));
                      toastService.error(message);
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
                        updateEntity({ id: data.id, changes: CollectionDto.from(data) }),
                        setFulfilled()
                      );
                      toastService.success(`Collection “${data.title}“ was saved`);
                    },
                    error: err => {
                      let message = `Collection “${data.title}” could not be saved`;
                      if (err instanceof ServerSideError) {
                        switch (err.message) {
                          case CollectionMessage.NotExist:
                            message = `Collection “${data.title}” to be updated does not exist`;
                            break;

                          default:
                            break;
                        }
                      }
                      toastService.error(message);
                      patchState(store, setError(err));
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
          map(id => store.entityMap()[id]),
          switchMap(data =>
            openConfirmDialog().pipe(
              tap(() => patchState(store, setPending())),
              switchMap(() =>
                collectionApi.delete(data.id).pipe(
                  tap({
                    next: () => {
                      patchState(store, removeEntity(data.id), setFulfilled());
                      toastService.success(`Collection “${data.title}“ was deleted`);
                    },
                    error: err => {
                      let message = `Collection “${data.title}” could not be deleted`;
                      if (err instanceof ServerSideError) {
                        switch (err.message) {
                          case CollectionMessage.NotExist:
                            message = `Collection “${data.title}” to be deleted does not exist`;
                            break;

                          default:
                            break;
                        }
                      }
                      patchState(store, setError(err));
                      toastService.error(message);
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
