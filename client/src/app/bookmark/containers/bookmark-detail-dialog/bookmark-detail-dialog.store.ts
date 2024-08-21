import { ServerSideError } from "@core/http";
import { tapResponse } from "@ngrx/component-store";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { MetadataDto } from "@shared/models";
import { prefix } from "@shared/utils";
import { pipe, switchMap } from "rxjs";
import { injectCrawlApi } from "../../data-access";

type BookmarkDetailDialogState = {
  metadata: MetadataDto | null;
};

const initialState: BookmarkDetailDialogState = {
  metadata: null,
};

export const BookmarkDetailDialogStore = signalStore(
  withState<BookmarkDetailDialogState>(initialState),
  withStatus(),
  withMethods(store => {
    const crawlApi = injectCrawlApi();

    return {
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
