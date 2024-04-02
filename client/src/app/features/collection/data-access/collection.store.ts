import { inject } from "@angular/core";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { setEntities, withEntities } from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { CollectionDto } from "@shared/models";
import { EMPTY, catchError, pipe, switchMap, tap } from "rxjs";
import { CollectionApi } from "./collection.api";

export const CollectionStore = signalStore(
  withStatus(),
  withEntities<CollectionDto>(),
  withMethods(store => {
    const collectionApi = inject(CollectionApi);

    return {
      findAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(() =>
            collectionApi.findAll().pipe(
              tap({
                next: res => {
                  patchState(store, setEntities(res.result.items), setFulfilled());
                },
                error: err => {
                  if (err instanceof ServerSideError) {
                    patchState(store, setError(err));
                  }
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
