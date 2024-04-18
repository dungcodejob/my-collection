import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { BookmarkVM, MetadataDto } from "@shared/models";
import { ToastService } from "@shared/services";
import { prefix } from "@shared/utils";
import { EMPTY, catchError, map, pipe, switchMap, tap } from "rxjs";
import { injectBookmarkApi, injectCrawlApi } from "..";

type BookmarkDetailState = {
  result: BookmarkVM | null;
};

const initialState: BookmarkDetailState = {
  result: null,
};

export const BookmarkDetailStore = signalStore(
  withStatus(),
  withState<BookmarkDetailState>(initialState),
  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const crawlApi = injectCrawlApi();
    const toastService = inject(ToastService);

    return {
      enter: () => patchState(store, initialState, { status: "idle" }),
      create: rxMethod<{ url: string; collectionId: string }>(
        pipe(
          switchMap(({ url, collectionId }) =>
            crawlApi.getMetadata(url).pipe(
              prefix(() => patchState(store, setPending())),
              map(res => res.result.data),
              switchMap((result: MetadataDto) =>
                bookmarkApi.create({ ...result, collectionId, note: "" })
              ),
              tap({
                next: res => {
                  const data = res.result.data;
                  patchState(store, { result: data }, setFulfilled());
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
      ),
    };
  })
);
