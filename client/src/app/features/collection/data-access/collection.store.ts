import { inject } from "@angular/core";
import { CollectionDetailDialogComponent } from "@collection/components/collection-detail-dialog/collection-detail-dialog.component";
import { ConfirmDialogComponent } from "@collection/components/confirm-dialog/confirm-dialog.component";
import { ServerSideError } from "@core/http";
import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { CollectionMessage } from "@shared/enums";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { ToastService } from "@shared/services";
import { isNotFalsy, isNotNil, prefix } from "@shared/utils";
import { HlmDialogService } from "@spartan-ng/ui-dialog-helm";
import { EMPTY, catchError, filter, map, of, pipe, switchMap, tap } from "rxjs";
import { injectCollectionApi } from ".";

type CollectionState = {
  entities: CollectionDto[];
};

const addCollection = (entity: CollectionDto): PartialStateUpdater<CollectionState> => {
  return state => {
    const entities = structuredClone(state.entities);

    entities.unshift(entity);

    return { ...state, entities };
  };
};

const updateCollection = (
  id: string,
  updater: Partial<CollectionDto>
): PartialStateUpdater<CollectionState> => {
  return state => {
    const entities = structuredClone(state.entities);

    const indexOfUpdate = entities.findIndex(collection => collection.id === id);
    if (indexOfUpdate !== -1) {
      entities[indexOfUpdate] = { ...entities[indexOfUpdate], ...updater };
    }

    return { ...state, entities };
  };
};

const deleteCollection = (id: string): PartialStateUpdater<CollectionState> => {
  return state => {
    let entities = structuredClone(state.entities);

    entities = entities.filter(collection => collection.id !== id);

    return { ...state, entities };
  };
};

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

const moveCollection = (
  fromIndex: number,
  toIndex: number
): PartialStateUpdater<CollectionState> => {
  return state => {
    const entities = structuredClone(state.entities);

    const from = clamp(fromIndex, entities.length - 1);
    const to = clamp(toIndex, entities.length - 1);

    if (from === to) {
      return state;
    }

    const target = entities[from];
    const delta = to < from ? -1 : 1;

    for (let i = from; i !== to; i += delta) {
      entities[i] = entities[i + delta];
    }

    entities[to] = target;

    return { ...state, entities };
  };
};

const initialState: CollectionState = {
  entities: [],
};

export const CollectionStore = signalStore(
  withStatus(),
  withState<CollectionState>(initialState),
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
          tap(() => {
            patchState(store, setPending());
          }),
          switchMap(() =>
            collectionApi.findAll().pipe(
              tap({
                next: res => {
                  patchState(
                    store,
                    { entities: CollectionDto.from(res.result.items) },
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
                  prefix(() => patchState(store, setPending())),
                  tap({
                    next: res => {
                      const data = res.result.data;
                      patchState(
                        store,
                        addCollection(CollectionDto.from(data)),
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
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          switchMap(data =>
            openDetailDialog(data).pipe(
              switchMap((result: UpdateCollectionDto) =>
                collectionApi.update(data.id, result).pipe(
                  prefix(() => patchState(store, setPending())),
                  tap({
                    next: res => {
                      const data = res.result.data;
                      patchState(store, state => ({ entities: state.entities }));
                      patchState(
                        store,
                        updateCollection(data.id, CollectionDto.from(data)),
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
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          switchMap(data =>
            openConfirmDialog().pipe(
              switchMap(() =>
                collectionApi.delete(data.id).pipe(
                  prefix(() => patchState(store, setPending())),
                  tap({
                    next: () => {
                      patchState(store, deleteCollection(data.id), setFulfilled());
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
      move: rxMethod<{ fromIndex: number; toIndex: number }>(
        pipe(
          switchMap(({ fromIndex, toIndex }) => {
            const entity = store.entities()[fromIndex];

            if (!entity) {
              return of();
            }

            let prevPosition = "";
            let nextPosition = "";
            if (fromIndex < toIndex) {
              prevPosition = store.entities()[toIndex]?.position ?? "";
              nextPosition = store.entities()[toIndex + 1]?.position ?? "";
            } else {
              prevPosition = store.entities()[toIndex - 1]?.position ?? "";
              nextPosition = store.entities()[toIndex]?.position ?? "";
            }

            return collectionApi.move(entity.id, { prevPosition, nextPosition }).pipe(
              prefix(() => patchState(store, moveCollection(fromIndex, toIndex))),
              tap({
                next: res =>
                  patchState(
                    store,
                    updateCollection(entity.id, CollectionDto.from(res.result.data))
                  ),
                error: err => {
                  patchState(store, moveCollection(toIndex, fromIndex));
                  if (err instanceof ServerSideError) {
                  }
                },
              }),
              catchError(() => EMPTY)
            );
          })
        )
      ),
    };
  })
);
