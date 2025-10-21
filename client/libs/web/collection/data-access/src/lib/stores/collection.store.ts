import { computed, inject } from "@angular/core";
import { tapHandleApi } from "@client/web-core-http";
import { COLLECTION_ROOT_ID, COLLECTION_ROOT_PATH } from "@client/web-shared-constants";
import {
  injectParams,
  NamedStatusState,
  setStatus,
  withStatus,
} from "@client/web-shared-utils";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap } from "rxjs";
import {
  CollectionFilter,
  CreateCollectionRequest,
  DeleteCollectionRequest,
  UpdateCollectionRequest,
} from "../models";
import { Collection } from "../models/collection";
import { CollectionAdapter } from "../services/collection.adapter";
import { CollectionApi } from "../services/collection.api";

const COLLECTION_ROOT: Collection = {
  id: COLLECTION_ROOT_ID,
  name: "root",
  path: COLLECTION_ROOT_PATH,
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
  withComputed((store, _collectionAdapter = inject(CollectionAdapter)) => {
    const $params = injectParams();
    const $selectedId = computed(() => {
      const params = $params() as { id: string };
      return params.id;
    });
    const $selectedCollection = computed(() => {
      console.log(store.collections());
      const selectedId = $selectedId();
      const collections = store.collections();
      return _collectionAdapter.getCollectionById(collections, selectedId);
    });
    return {
      $selectedId,
      $selectedCollection,
    };
  }),
  withMethods(
    (
      store,
      _collectionApi = inject(CollectionApi),
      _collectionAdapter = inject(CollectionAdapter)
    ) => ({
      load: rxMethod<CollectionFilter>(
        pipe(
          switchMap(filter =>
            _collectionApi.loadCollections(filter).pipe(
              tapHandleApi({
                successFn: result =>
                  patchState(store, {
                    collections: _collectionAdapter.setCollections(
                      store.collections(),
                      filter.path,
                      result.items
                    ),
                  }),
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
                successFn: result =>
                  patchState(store, {
                    collections: _collectionAdapter.addCollection(
                      store.collections(),
                      request.path,
                      result.data
                    ),
                  }),
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
                successFn: result =>
                  patchState(store, {
                    collections: _collectionAdapter.updateCollection(
                      store.collections(),
                      request.path,
                      result.data
                    ),
                  }),
                statusFn: status =>
                  patchState(store, setStatus(status, collectionStatusNames.update)),
              })
            )
          )
        )
      ),
      delete: rxMethod<DeleteCollectionRequest>(
        pipe(
          switchMap(request =>
            _collectionApi.deleteCollection(request).pipe(
              tapHandleApi({
                successFn: () =>
                  patchState(store, {
                    collections: _collectionAdapter.deleteCollection(
                      store.collections(),
                      request.path,
                      request.id
                    ),
                  }),
                statusFn: status =>
                  patchState(store, setStatus(status, collectionStatusNames.update)),
              })
            )
          )
        )
      ),
    })
  ),
  withHooks({
    onInit: () => {
      console.log("CollectionStore onInit");
    },
  })
);
