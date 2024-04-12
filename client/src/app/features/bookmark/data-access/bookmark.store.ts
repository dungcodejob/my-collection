import { inject } from "@angular/core";
import { BookmarkDetailDialogComponent } from "@bookmark/components/bookmark-detail-dialog/bookmark-detail-dialog.component";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
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
import { BookmarkVM, MetadataDto } from "@shared/models";
import { ToastService } from "@shared/services";
import { PadDialogService } from "@shared/ui";
import { isNotNil, prefix } from "@shared/utils";
import { EMPTY, catchError, filter, map, pipe, switchMap, tap } from "rxjs";
import { injectBookmarkApi, injectCrawlApi } from ".";

export const BookmarkStore = signalStore(
  withStatus(),
  withEntities<BookmarkVM>(),
  withPagination(),
  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const crawlApi = injectCrawlApi();
    const dialogService = inject(PadDialogService);
    const toastService = inject(ToastService);

    const openDetailDialog = (data: BookmarkVM | null) => {
      return dialogService
        .open(BookmarkDetailDialogComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[30rem]",
          context: { data },
        })
        .closed$.pipe(filter(isNotNil));
    };

    return {
      findAll: rxMethod<string>(
        pipe(
          tap(() => {
            patchState(store, setPending());
          }),
          switchMap(collectionId =>
            bookmarkApi
              .findAll({
                collectionId: collectionId,
                currentPage: store.currentPage(),
                pageSize: store.pageSize(),
                keyword: "",
              })
              .pipe(
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
              )
          )
        )
      ),
      create: rxMethod<string>(
        pipe(
          switchMap(collectionId =>
            openDetailDialog(null).pipe(
              switchMap(({ url }) =>
                crawlApi.getMetadata(url).pipe(
                  map(res => res.result.data),
                  switchMap((result: MetadataDto) =>
                    bookmarkApi.create({ ...result, collectionId, note: "" })
                  ),
                  prefix(() => patchState(store, setPending())),
                  tap({
                    next: res => {
                      const data = res.result.data;
                      patchState(store, addEntity(data), setFulfilled());
                      toastService.success(`Bookmark “${data.title}“ was created`);
                    },
                    error: err => {
                      const message = "Bookmark could not be created";
                      // TODO: using logger service
                      console.log(err);
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
      delete: rxMethod<string>(
        pipe(
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          switchMap(data =>
            dialogService
              .openConfirmDialog({
                description: `This action cannot be undone. It will permanently delete your bookmark, from our servers`,
                confirmText: `Delete bookmark`,
              })
              .pipe(
                switchMap(() =>
                  bookmarkApi.delete(data.id).pipe(
                    prefix(() => patchState(store, setPending())),
                    tap({
                      next: () => {
                        patchState(store, removeEntity(data.id), setFulfilled());
                        toastService.success(`Bookmark “${data.title}“ was deleted`);
                      },
                      error: err => {
                        let message = `Bookmark “${data.title}” could not be deleted`;
                        if (err instanceof ServerSideError) {
                          switch (err.message) {
                            case BookmarkMessage.NotExist:
                              message = `Bookmark “${data.title}” to be deleted does not exist`;
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
