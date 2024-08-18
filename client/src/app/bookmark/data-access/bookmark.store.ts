import { inject } from "@angular/core";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  setError,
  setFulfilled,
  setPending,
  withPagination,
  withStatus,
} from "@shared/data-access";

import { tapResponse } from "@ngrx/component-store";
import { MessageKeys } from "@shared/constants";
import {
  BookmarkFilterDto,
  BookmarkVM,
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { ToastService } from "@shared/services";
import { isNotNil, prefix } from "@shared/utils";
import { filter, map, pipe, switchMap, tap } from "rxjs";
import { injectBookmarkApi } from "./bookmark/bookmark.provider";
type BookmarkState = {
  filter: BookmarkFilterDto | null;
};

const initialState: BookmarkState = {
  filter: null,
};

export const BookmarkStore = signalStore(
  withState<BookmarkState>(initialState),
  withEntities<BookmarkVM>(),
  withPagination(),
  withStatus({ name: "list" }),
  withStatus({ name: "item" }),
  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const toastService = inject(ToastService);

    return {
      setFilter: rxMethod<BookmarkFilterDto>(value$ => {
        return value$.pipe(tap(value => patchState(store, { filter: value })));
      }),
      findAll: rxMethod<void>(
        pipe(
          switchMap(() => {
            const filter = store.filter();
            const pagination = store.$pagination();
            const query = { ...filter, ...pagination };
            return bookmarkApi.findAll(query).pipe(
              prefix(() => patchState(store, setPending("list"))),
              tapResponse({
                next: res =>
                  patchState(
                    store,
                    setAllEntities(res.result.items),
                    setFulfilled("list")
                  ),
                error: (err: any) => patchState(store, setError(err, "list")),
              })
            );
          })
        )
      ),
      create: rxMethod<CreateBookmarkDto>(
        pipe(
          switchMap(bookmarkToCreate =>
            bookmarkApi.create(bookmarkToCreate).pipe(
              prefix(() => patchState(store, setPending("item"))),
              tapResponse({
                next: res => {
                  const data = res.result.data;
                  patchState(store, addEntity(data), setFulfilled("item"));

                  toastService.success(`Bookmark “${data.title}“ was created`);
                },
                error: (err: any) => {
                  const message = "Bookmark could not be created";

                  patchState(store, setError(err, "item"));
                  toastService.error(message);
                },
              })
            )
          )
        )
      ),
      update: rxMethod<UpdateBookmarkDto>(
        pipe(
          switchMap(bookmarkToUpdate =>
            bookmarkApi.update(bookmarkToUpdate.id, bookmarkToUpdate).pipe(
              prefix(() => patchState(store, setPending("item"))),
              tapResponse({
                next: res => {
                  const data = res.result.data;

                  patchState(
                    store,
                    updateEntity({ id: data.id, changes: data }),
                    setFulfilled("item")
                  );

                  toastService.success(`Bookmark “${data.title}“ was updated`);
                },
                error: (err: any) => {
                  patchState(store, setError(err, "item"));

                  const message = "Bookmark could not be updated";
                  toastService.error(message);
                },
              })
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
              prefix(() => patchState(store, setPending("item"))),
              tapResponse({
                next: () => {
                  patchState(
                    store,
                    removeEntity(bookmarkToDelete.id),
                    setFulfilled("item")
                  );
                  toastService.success(
                    `Bookmark “${bookmarkToDelete.title}“ was deleted`
                  );
                },
                error: (err: any) => {
                  patchState(store, setError(err, "item"));

                  if (err instanceof ServerSideError) {
                    const Messages: Record<string, string> = {
                      [MessageKeys.Bookmark.NotExist]:
                        `Bookmark “${bookmarkToDelete.title}” to be deleted does not exist`,

                      default: `Bookmark “${bookmarkToDelete.title}” could not be deleted`,
                    };

                    const key = err.message;
                    const message = Messages[key] || Messages["default"];
                    toastService.error(message);
                  }
                },
              })
            )
          )
        )
      ),
    };
  })
);
