import { inject } from "@angular/core";
import { tapHandleApi } from "@client/web-core-http";
import { NamedStatusState, setStatus, withStatus } from "@client/web-shared-utils";
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap } from "rxjs";
import {
  CollectionFilter,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "../models";
import { Collection } from "../models/collection";
import { CollectionService } from "../services/collection.service";
import { withCollectionReducer } from "./collection.reducer";
const COLLECTION_ROOT: Collection = {
  id: "",
  name: "root",
  path: "/",
  isHasChild: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  children: [],
};

export const collectionStatusNames = {
  list: "list",
  details: "details",
  create: "create",
  update: "update",
} as const;

export type CollectionState = {
  collections: {
    [path: string]: Collection[];
  };
  root: Collection;
};

export type CollectionStateWithFeature = CollectionState &
  NamedStatusState<typeof collectionStatusNames.list> &
  NamedStatusState<typeof collectionStatusNames.details> &
  NamedStatusState<typeof collectionStatusNames.create> &
  NamedStatusState<typeof collectionStatusNames.update>;

const initialState: CollectionState = {
  collections: {},
  root: COLLECTION_ROOT,
};

export const CollectionStore = signalStore(
  withState(initialState),
  withStatus({
    names: [
      collectionStatusNames.list,
      collectionStatusNames.create,
      collectionStatusNames.update,
    ],
  }),
  withCollectionReducer(),
  withMethods((store, _collectionApi = inject(CollectionService)) => ({
    load: rxMethod<CollectionFilter>(
      pipe(
        switchMap(filter =>
          _collectionApi.loadCollections(filter).pipe(
            tapHandleApi({
              successFn: result => store._setCollections(filter.path, result.items),
              statusFn: status =>
                patchState(store, setStatus(status, collectionStatusNames.list)),
            })
          )
        )
      )
    ),
    create: rxMethod<CreateCollectionRequest>(
      pipe(
        switchMap(request =>
          _collectionApi.createCollection(request).pipe(
            tapHandleApi({
              successFn: result => store._createCollection(request.path, result.data),
              statusFn: status =>
                patchState(store, setStatus(status, collectionStatusNames.create)),
            })
          )
        )
      )
    ),
    update: rxMethod<UpdateCollectionRequest>(
      pipe(
        switchMap(request =>
          _collectionApi.updateCollection(request).pipe(
            tapHandleApi({
              successFn: result => store._updateCollection(request.path, result.data),
              statusFn: status =>
                patchState(store, setStatus(status, collectionStatusNames.update)),
            })
          )
        )
      )
    ),
  })),
  withHooks({
    onInit: () => {
      console.log("CollectionStore onInit");
    },
  })
);
