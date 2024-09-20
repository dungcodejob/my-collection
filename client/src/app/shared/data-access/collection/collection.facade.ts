import { computed, inject } from "@angular/core";
import { CollectionDetailDialogComponent } from "@collection/components/collection-detail-dialog/collection-detail-dialog.component";
import { ServerSideError } from "@core/http";
import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { AppFacade, setPending, withStatus } from "@shared/data-access";

import { CollectionVM, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { ToastService } from "@shared/services";

import { LogService } from "@core/log";
import { tapResponse } from "@ngrx/operators";
import { getMessage, MessageKeys } from "@shared/constants";
import { PadDialogService } from "@shared/ui";
import { injectParams, isNotNil, prefix } from "@shared/utils";
import { plainToInstance } from "class-transformer";
import {
  catchError,
  EMPTY,
  filter,
  map,
  Observable,
  of,
  pipe,
  switchMap,
  tap,
} from "rxjs";
import { injectCollectionApi } from ".";

interface CollectionState {
  selectedId: string | null;
  entities: CollectionVM[];
}

const initialState: CollectionState = {
  selectedId: null,
  entities: [],
};
const addCollection = (entity: CollectionVM): PartialStateUpdater<CollectionState> => {
  return state => {
    const entities = structuredClone(state.entities);

    entities.unshift(entity);

    return { ...state, entities: entities };
  };
};

const updateCollection = (
  id: string,
  updater: Partial<CollectionVM>
): PartialStateUpdater<CollectionState> => {
  return state => {
    const entities = structuredClone(state.entities);

    const indexOfUpdate = entities.findIndex(collection => collection.id === id);
    if (indexOfUpdate !== -1) {
      entities[indexOfUpdate] = { ...entities[indexOfUpdate], ...updater };
    }

    return { ...state, entities: entities };
  };
};

const deleteCollection = (id: string): PartialStateUpdater<CollectionState> => {
  return state => {
    let entities = structuredClone(state.entities);

    entities = entities.filter(collection => collection.id !== id);

    return { ...state, entities: entities };
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

    return { ...state, entities: entities };
  };
};

export const CollectionFacade = signalStore(
  withStatus(),
  withState<CollectionState>(initialState),
  withComputed(store => {
    const $params = injectParams();

    const $selectedId = computed(() => $params()["collectionId"] as string);

    return {
      $selectedId,
      $selectedEntity: computed(() => {
        const entities = store.entities();
        const selectedId = $selectedId();

        return entities.find(entity => entity.id === selectedId);
      }),
    };
  }),
  withMethods(store => {
    const collectionApi = injectCollectionApi();
    const dialogService = inject(PadDialogService);
    const toastService = inject(ToastService);
    const appFacade = inject(AppFacade);
    const logService = inject(LogService);

    const useAppStatus = <T>() => {
      return (source$: Observable<T>) =>
        source$.pipe(
          prefix(() => appFacade.setStatus("pending")),
          tap({
            next: () => appFacade.setStatus("fulfilled"),
            error: error => appFacade.setStatus({ error: error }),
          })
        );
    };

    const openDetailDialog = (data: CollectionVM | null) => {
      return dialogService
        .open(CollectionDetailDialogComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[30rem]",
          context: { data },
        })
        .closed$.pipe(filter(isNotNil));
    };

    return {
      findAll: rxMethod<void>(
        pipe(
          switchMap(() =>
            collectionApi.findAll().pipe(
              useAppStatus(),
              tapResponse({
                next: res => {
                  const items = plainToInstance(CollectionVM, res.result.items);
                  patchState(store, { entities: items });
                },
                error: err => logService.error("CollectionFacade.findAll", err),
              })
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
                  useAppStatus(),
                  tapResponse({
                    next: res => {
                      const data = plainToInstance(CollectionVM, res.result.data);
                      patchState(store, addCollection(data));

                      const key = res.message ?? MessageKeys.Bookmark.CreateSuccess;
                      const message = getMessage(key);
                      toastService.success(message, {
                        params: [data.title],
                      });
                    },
                    error: () => {
                      const message = "Collection could not be created";
                      toastService.error(message);
                    },
                  })
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
                  useAppStatus(),
                  tapResponse({
                    next: res => {
                      const data = plainToInstance(CollectionVM, res.result.data);

                      patchState(store, state => ({ entities: state.entities }));
                      patchState(store, updateCollection(data.id, data));

                      const key = res.message ?? MessageKeys.Bookmark.CreateSuccess;
                      const message = getMessage(key);
                      toastService.success(message, { params: [data.title] });
                    },
                    error: err => {
                      if (err instanceof ServerSideError) {
                        const key = err.message ?? MessageKeys.Bookmark.CreateSuccess;
                        const message = getMessage(key);
                        toastService.error(message);
                      }
                    },
                  })
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
            dialogService
              .openConfirmDialog({
                description: `This action cannot be undone. It will permanently delete your collection, along with any bookmarks and other collections within it, from our servers`,
                confirmText: `Delete collection`,
              })
              .pipe(
                switchMap(() =>
                  collectionApi.delete(data.id).pipe(
                    useAppStatus(),
                    tapResponse({
                      next: () => {
                        patchState(store, deleteCollection(data.id));
                        toastService.success(`Collection “${data.title}“ was deleted`);
                      },
                      error: err => {
                        let message = `Collection “${data.title}” could not be deleted`;
                        if (err instanceof ServerSideError) {
                          switch (err.message) {
                            case MessageKeys.Collection.NotExist:
                              message = `Collection “${data.title}” to be deleted does not exist`;
                              break;

                            default:
                              break;
                          }
                        }
                        // TODO: using logger service
                        logService.error("CollectionFacade.delete", err);
                        toastService.error(message);
                      },
                    })
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
                next: res => {
                  const data = plainToInstance(CollectionVM, res.result.data);
                  patchState(store, updateCollection(entity.id, data));
                },
                error: err => {
                  // TODO: using logger service
                  logService.error("CollectionFacade.move", err);
                  patchState(store, moveCollection(toIndex, fromIndex));
                },
              }),
              catchError(() => EMPTY)
            );
          })
        )
      ),
    };
  }),
  withHooks(store => {
    return {
      onInit: () => {
        store.findAll();
      },
    };
  })
);
