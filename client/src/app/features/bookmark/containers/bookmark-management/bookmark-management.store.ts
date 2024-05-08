import { inject } from "@angular/core";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setAllEntities,
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
import { BookmarkMessage } from "@shared/enums";
import { BookmarkFilterDto, BookmarkVM, CreateBookmarkDto } from "@shared/models";
import { ToastService } from "@shared/services";
import { isNotNil, prefix } from "@shared/utils";
import { EMPTY, catchError, filter, map, pipe, switchMap, tap } from "rxjs";
import { injectBookmarkApi } from "../../data-access";

type BookmarkState = {
  filter: BookmarkFilterDto | null;
  selectedId: string | null;
};

const initialState: BookmarkState = {
  filter: null,
  selectedId: null,
};

export const BookmarkManagementStore = signalStore(
  withState<BookmarkState>(initialState),
  withStatus({ name: "fetch" }),
  withStatus({ name: "layout" }),
  withEntities<BookmarkVM>(),
  withPagination(),
  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const toastService = inject(ToastService);

    return {
      ...store,
      select: (id: string | null) => patchState(store, { selectedId: id }),
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
              tap(value => console.log(value)),
              prefix(() => patchState(store, setPending("fetch"))),
              tap({
                next: res => {
                  patchState(
                    store,
                    setAllEntities(res.result.items),
                    setFulfilled("fetch")
                  );
                },
                error: err => {
                  // TODO: using logger service
                  patchState(store, setError(err, "fetch"));
                },
              }),
              catchError(() => EMPTY)
            );
          })
        )
      ),
      create: rxMethod<CreateBookmarkDto>(
        pipe(
          switchMap(bookmarkToAdd =>
            bookmarkApi.create(bookmarkToAdd).pipe(
              prefix(() => patchState(store, setPending("layout"))),
              tap({
                next: res => {
                  const data = res.result.data;
                  patchState(store, addEntity(data), setFulfilled("layout"));

                  toastService.success(`Bookmark “${data.title}“ was created`);
                },
                error: err => {
                  const message = "Bookmark could not be created";
                  // TODO: using logger service
                  console.log(err);
                  patchState(store, setError(err, "layout"));
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
              prefix(() => patchState(store, setPending("layout"))),
              tap({
                next: () => {
                  patchState(
                    store,
                    removeEntity(bookmarkToDelete.id),
                    setFulfilled("layout")
                  );
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
                  patchState(store, setError(err, "layout"));
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
