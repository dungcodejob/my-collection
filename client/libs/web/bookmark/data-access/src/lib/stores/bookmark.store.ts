import { inject } from "@angular/core";
import { tapHandleApi } from "@client/web-core-http";
import {
  injectParams,
  NamedStatusState,
  setStatus,
  withStatus,
} from "@client/web-shared-utils";
import { patchState, signalStore, withMethods, withProps } from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap } from "rxjs";
import {
  BookmarkCreateDto,
  BookmarkDto,
  BookmarkFilterDto,
  BookmarkUpdateDto,
} from "../models";
import { BookmarkApi } from "../services";
export const bookmarkStatusNames = {
  list: "list",
  details: "details",
  create: "create",
  update: "update",
} as const;

export type BookmarkStateWithFeature = NamedStatusState<typeof bookmarkStatusNames.list> &
  NamedStatusState<typeof bookmarkStatusNames.details> &
  NamedStatusState<typeof bookmarkStatusNames.create> &
  NamedStatusState<typeof bookmarkStatusNames.update>;

export const BookmarkStore = signalStore(
  withEntities<BookmarkDto>(),
  withStatus({
    names: [
      bookmarkStatusNames.list,
      bookmarkStatusNames.details,
      bookmarkStatusNames.create,
      bookmarkStatusNames.update,
    ],
  }),
  withProps(() => ({
    $params: injectParams(),
    _bookmarkApi: inject(BookmarkApi),
  })),
  withMethods(({ _bookmarkApi, ...store }) => ({
    load: rxMethod<BookmarkFilterDto>(
      pipe(
        switchMap(filter =>
          _bookmarkApi.loadBookmarks(filter).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, setAllEntities(result.items));
              },
              errorFn: error => {
                console.error("Failed to load bookmarks:", error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, bookmarkStatusNames.list));
              },
            })
          )
        )
      )
    ),

    loadById: rxMethod<{ id: string }>(
      pipe(
        switchMap(({ id }) =>
          _bookmarkApi.findBookmarkById(id).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, addEntity(result.data));
              },
              errorFn: error => {
                console.error(`Failed to load bookmark ${id}:`, error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, bookmarkStatusNames.details));
              },
            })
          )
        )
      )
    ),

    create: rxMethod<BookmarkCreateDto>(
      pipe(
        switchMap(request =>
          _bookmarkApi.createBookmark(request).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, addEntity(result.data));
              },
              errorFn: error => {
                console.error("Failed to create bookmark:", error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, bookmarkStatusNames.create));
              },
            })
          )
        )
      )
    ),

    update: rxMethod<BookmarkUpdateDto & { id: string }>(
      pipe(
        switchMap(request =>
          _bookmarkApi.updateBookmark(request).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, updateEntity({ id: request.id, changes: result.data }));
              },
              errorFn: error => {
                console.error(`Failed to update bookmark ${request.id}:`, error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, bookmarkStatusNames.update));
              },
            })
          )
        )
      )
    ),

    delete: rxMethod<{ id: string }>(
      pipe(
        switchMap(({ id }) =>
          _bookmarkApi.deleteBookmark({ id }).pipe(
            tapHandleApi({
              successFn: () => {
                patchState(store, removeEntity(id));
              },
              errorFn: error => {
                console.error(`Failed to delete bookmark ${id}:`, error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, bookmarkStatusNames.update));
              },
            })
          )
        )
      )
    ),
  }))
);
