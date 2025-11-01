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
  updateAllEntities,
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
              successFn: result => patchState(store, setAllEntities(result.items)),
              statusFn: status =>
                patchState(store, setStatus(status, bookmarkStatusNames.list)),
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
              successFn: result => patchState(store, addEntity(result.data)),
              statusFn: status =>
                patchState(store, setStatus(status, bookmarkStatusNames.create)),
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
              successFn: result => patchState(store, updateAllEntities(result.data)),
              statusFn: status =>
                patchState(store, setStatus(status, bookmarkStatusNames.update)),
            })
          )
        )
      )
    ),
    delete: rxMethod<{ id: string }>(
      pipe(
        switchMap(request =>
          _bookmarkApi.deleteBookmark(request).pipe(
            tapHandleApi({
              successFn: () => patchState(store, removeEntity(request.id)),
              statusFn: status =>
                patchState(store, setStatus(status, bookmarkStatusNames.update)),
            })
          )
        )
      )
    ),
  }))
);
