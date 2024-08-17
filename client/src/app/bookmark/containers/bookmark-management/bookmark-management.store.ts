import { inject } from "@angular/core";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, type, withMethods, withState } from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  RootFacade,
  setError,
  setFulfilled,
  setPending,
  withPagination,
  withStatus,
} from "@shared/data-access";
import { withApiFeature } from "@shared/data-access/api/api.feature";
import { BookmarkMessage } from "@shared/enums";
import {
  BookmarkFilterDto,
  BookmarkVM,
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { ToastService } from "@shared/services";
import { isNotNil, prefix } from "@shared/utils";
import { EMPTY, catchError, filter, map, pipe, switchMap, tap } from "rxjs";
import { injectBookmarkApi } from "../../data-access";

type BookmarkState = {
  filter: BookmarkFilterDto | null;
};

const initialState: BookmarkState = {
  filter: null,
};

export const BookmarkManagementStore = signalStore(
  withState<BookmarkState>(initialState),
  withEntities<BookmarkVM>(),
  withStatus(),
  withPagination(),
  withApiFeature({ name: "bookmark", type: type<BookmarkVM[]>() }),
  withApiFeature({ name: "create", type: type<BookmarkVM>() }),
  withApiFeature({ name: "update", type: type<BookmarkVM>() }),
  // withStatus({ name: "fetch" }),
  withApiFeature({ name: "delete", type: type<BookmarkVM>() }),
  // withStatus({ name: "layout" }),

  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const toastService = inject(ToastService);
    const appFacade = inject(RootFacade);

    return {
      setFilter: (filter: BookmarkFilterDto | null) =>
        patchState(store, state => ({
          ...state,
          filter: { ...state.filter, ...filter },
        })),
      findAll: rxMethod<void>(
        pipe(
          switchMap(() => {
            const filter = store.filter();
            const pagination = store.$pagination();
            const query = { ...filter, ...pagination };
            return bookmarkApi.findAll(query).pipe(
              prefix(() => patchState(store, setPending())),
              tap({
                next: res => {
                  patchState(store, setAllEntities(res.result.items), setFulfilled());
                },
                error: err => {
                  // TODO: using logger service
                  patchState(store, setError(err));
                },
              }),
              catchError(() => EMPTY)
            );
          })
        )
      ),
      create: rxMethod<CreateBookmarkDto>(
        pipe(
          switchMap(bookmarkToCreate =>
            bookmarkApi.create(bookmarkToCreate).pipe(
              appFacade.useLoading(),
              tap({
                next: res => {
                  const data = res.result.data;
                  patchState(store, addEntity(data));

                  toastService.success(`Bookmark “${data.title}“ was created`);
                },
                error: err => {
                  const message = "Bookmark could not be created";
                  // TODO: using logger service
                  console.log(err);
                  patchState(store);
                  toastService.error(message);
                },
              }),
              catchError(() => EMPTY)
            )
          )
        )
      ),
      update: rxMethod<UpdateBookmarkDto>(
        pipe(
          switchMap(bookmarkToUpdate =>
            bookmarkApi.update(bookmarkToUpdate.id, bookmarkToUpdate).pipe(
              appFacade.useLoading(),
              tap({
                next: res => {
                  const data = res.result.data;
                  patchState(store, updateEntity({ id: data.id, changes: data }));

                  toastService.success(`Bookmark “${data.title}“ was updated`);
                },
                error: err => {
                  const message = "Bookmark could not be updated";
                  // TODO: using logger service
                  console.log(err);
                  toastService.error(message);
                },
              }),
              catchError(() => EMPTY)
            )
          )
        )
      ),
      delete: rxMethod<string>(
        pipe(
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          switchMap(bookmarkToDelete =>
            bookmarkApi.delete(bookmarkToDelete.id).pipe(
              appFacade.useLoading(),
              tap({
                next: () => {
                  patchState(store, removeEntity(bookmarkToDelete.id));
                  toastService.success(
                    `Bookmark “${bookmarkToDelete.title}“ was deleted`
                  );
                },
                error: err => {
                  let message = `Bookmark “${bookmarkToDelete.title}” could not be deleted`;
                  if (err instanceof ServerSideError) {
                    switch (err.message) {
                      case BookmarkMessage.NotExist:
                        message = `Bookmark “${bookmarkToDelete.title}” to be deleted does not exist`;
                        break;

                      default:
                        break;
                    }
                  }
                  toastService.error(message);
                },
              }),
              catchError(() => EMPTY)
            )
          )
        )
      ),
    };
  })
);
