import { inject } from "@angular/core";
import { CollectionDetailComponent } from "@collection/components/collection-detail/collection-detail.component";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { addEntity, setEntities, withEntities } from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { CollectionDto, CreateCollectionDto } from "@shared/models";
import { isNotNil } from "@shared/utils";
import { HlmDialogService } from "@spartan-ng/ui-dialog-helm";
import { EMPTY, catchError, filter, pipe, switchMap, tap } from "rxjs";
import { CollectionApi } from "./collection.api";

export const CollectionStore = signalStore(
  withStatus(),
  withEntities<CollectionDto>(),
  withMethods(store => {
    const collectionApi = inject(CollectionApi);
    const dialogService = inject(HlmDialogService);

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
      create: rxMethod<void>(
        pipe(
          switchMap(() =>
            dialogService
              .open(CollectionDetailComponent, {
                closeOnBackdropClick: false,
                contentClass: "max-w-[30rem]",
              })
              .closed$.pipe(filter(isNotNil))
          ),
          tap(() => patchState(store, setPending())),
          switchMap((data: CreateCollectionDto) =>
            collectionApi.create(data).pipe(
              tap({
                next: res => {
                  patchState(store, addEntity(res.result.data), setFulfilled());
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
