import { computed } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  CollectionVM,
  CollectionVMBuilder,
  CreateCollectionDto,
  Identity,
  UpdateCollectionDto,
} from "@nx/web-shared-models";
import { ToastOption } from "@nx/web-shared-services";
import {
  injectParams,
  isNotNil,
  setFulfilled,
  setPending,
  tapPrefix,
  withStatus,
} from "@nx/web-shared-utils";
import { delay, filter, map, tap } from "rxjs";

enum StatusName {
  List = "list",
  Detail = "detail",
}

type CollectionState = {
  toast: ToastOption | null;
};

const initialState: CollectionState = {
  toast: null,
};

export const CollectionsStore = signalStore(
  withState(initialState),
  withEntities<CollectionVM>(),
  withStatus({ name: StatusName.Detail }),
  withStatus({ name: StatusName.List }),
  withComputed(store => {
    const $params = injectParams();
    const $items = computed(() => store.entities().sort((a, b) => a.index - b.index));
    const $selectedId = computed(() => $params()["id"] as Identity | null);
    const $selectedEntity = computed(() => {
      const selectedId = $selectedId();
      return $items().find(item => item.id === selectedId);
    });
    return {
      $items,
      $selectedId,
      $selectedEntity,
    };
  }),
  withMethods(({ ...store }) => {
    const builder = new CollectionVMBuilder();
    return {
      findByQuery: () => {
        patchState(store, setEntities([builder.build(), builder.build()]));
      },
      create: rxMethod<CreateCollectionDto>(collectionToCreate$ =>
        collectionToCreate$.pipe(
          tapPrefix(() => {
            patchState(store, setPending(StatusName.Detail));
          }),
          delay(500),
          tap(collectionToCreate => {
            const item = builder
              .with("title", collectionToCreate.title)
              .with("icon", collectionToCreate.icon)
              .build();

            patchState(store, addEntity(item), setFulfilled(StatusName.Detail));
          })
        )
      ),
      update: rxMethod<UpdateCollectionDto>(collectionToUpdate$ =>
        collectionToUpdate$.pipe(
          tapPrefix(() => {
            patchState(store, setPending(StatusName.Detail));
          }),
          delay(500),
          tap(collectionToUpdate => {
            const item = store.entityMap()[collectionToUpdate.id];

            patchState(
              store,
              updateEntity({
                id: item.id,
                changes: new CollectionVM({ ...item, ...collectionToUpdate }),
              }),
              setFulfilled(StatusName.Detail)
            );
          })
        )
      ),
      delete: rxMethod<Identity>(id$ =>
        id$.pipe(
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          tapPrefix(() => {
            patchState(store, setPending(StatusName.Detail));
          }),
          delay(500),
          tap(item => {
            patchState(store, removeEntity(item.id), setFulfilled(StatusName.Detail));
          })
        )
      ),
    };
  })
);
