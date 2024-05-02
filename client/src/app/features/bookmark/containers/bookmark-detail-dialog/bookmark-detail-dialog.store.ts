import { inject } from "@angular/core";
import { ServerSideError } from "@core/http";
import { tapResponse } from "@ngrx/component-store";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
    setError,
    setFulfilled,
    setPending,
    withPagination,
    withStatus,
} from "@shared/data-access";
import { BookmarkVM, MetadataDto } from "@shared/models";
import { ToastService } from "@shared/services";
import { prefix } from "@shared/utils";
import { pipe, switchMap } from "rxjs";
import { injectBookmarkApi, injectCrawlApi } from "../../data-access";

type BookmarkDetailDialogState = {
  metadata: MetadataDto | null;
  result: BookmarkVM | null;
};

const initialState: BookmarkDetailDialogState = {
  metadata: null,
  result: null,
};

export const BookmarkDetailDialogStore = signalStore(
  withStatus(),
  withPagination(),
  withState<BookmarkDetailDialogState>(initialState),
  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const crawlApi = injectCrawlApi();
    const toastService = inject(ToastService);

    return {
      ...store,
      getMetadata: rxMethod<string>(
        pipe(
          switchMap(url =>
            crawlApi.getMetadata(url).pipe(
              prefix(() => patchState(store, setPending())),
              tapResponse(
                res => patchState(store, { metadata: res.result.data }, setFulfilled()),
                err => patchState(store, setError(err as ServerSideError))
              )
            )
          )
        )
      ),
    };
  })
);
