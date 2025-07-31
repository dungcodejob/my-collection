import { inject } from "@angular/core";
import { mapToErrorAction, mapToSuccessAction } from "@client/web-core-http";
import { signalStoreFeature, type } from "@ngrx/signals";
import { Events, withEffects } from "@ngrx/signals/events";
import { switchMap } from "rxjs";
import { CollectionService } from "../services/collection.service";
import { collectionApiEvents, collectionEvents } from "./collection.event";
import { CollectionState } from "./collection.store";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withCollectionEffects() {
  return signalStoreFeature(
    { state: type<CollectionState>() },
    withEffects((store, events = inject(Events), api = inject(CollectionService)) => {
      return {
        // Create collection effect
        createCollection$: events.on(collectionEvents.create).pipe(
          switchMap(({ payload }) => {
            return api.createCollection(payload.request).pipe(
              mapToSuccessAction(res =>
                collectionApiEvents.createSuccess({
                  collection: res.data,
                })
              ),
              mapToErrorAction(error =>
                collectionApiEvents.createFailed({
                  error,
                })
              )
            );
          })
        ),

        // Update collection effect
        updateCollection$: events.on(collectionEvents.update).pipe(
          switchMap(({ payload }) => {
            return api.updateCollection(payload.request).pipe(
              mapToSuccessAction(res =>
                collectionApiEvents.updateSuccess({
                  collection: res.data,
                })
              ),
              mapToErrorAction(error =>
                collectionApiEvents.updateFailed({
                  error,
                })
              )
            );
          })
        ),

        // Delete collection effect
        deleteCollection$: events.on(collectionEvents.delete).pipe(
          switchMap(({ payload }) => {
            return api.deleteCollection(payload.request).pipe(
              mapToSuccessAction(res =>
                collectionApiEvents.deleteSuccess({
                  id: res.data.id,
                  path: res.data.path,
                })
              ),
              mapToErrorAction(error =>
                collectionApiEvents.deleteFailed({
                  error,
                })
              )
            );
          })
        ),

        // Load collections effect
        loadCollections$: events.on(collectionEvents.load).pipe(
          switchMap(({ payload }) => {
            return api.loadCollections(payload.filter).pipe(
              mapToSuccessAction(res =>
                collectionApiEvents.loadSuccess({
                  path: payload.filter.path,
                  collections: res.items,
                })
              ),
              mapToErrorAction(error =>
                collectionApiEvents.loadFailed({
                  error,
                })
              )
            );
          })
        ),
      };
    })
  );
}
