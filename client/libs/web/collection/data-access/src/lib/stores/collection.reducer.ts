import { setError, setFulfilled, setPending } from "@client/web-shared-utils";
import { signalStoreFeature, type } from "@ngrx/signals";
import { on, withReducer } from "@ngrx/signals/events";
import { collectionApiEvents, collectionEvents } from "./collection.event";
import { CollectionStateWithFeature, collectionStatusNames } from "./collection.store";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withCollectionReducer() {
  return signalStoreFeature(
    {
      state: type<CollectionStateWithFeature>(),
    },
    withReducer(
      on(collectionEvents.load, (_, state) => ({
        ...state,
        ...setPending(collectionStatusNames.list),
      })),
      on(
        collectionEvents.create,
        collectionEvents.update,
        collectionEvents.delete,
        collectionEvents.move,
        (_, state) => ({
          ...state,
          ...setPending(collectionStatusNames.details),
        })
      ),
      on(collectionApiEvents.loadSuccess, ({ payload }, state) => {
        return {
          ...setFulfilled(collectionStatusNames.list),
          collections: {
            ...state.collections,
            [payload.path]: payload.collections,
          },
        };
      }),

      on(collectionApiEvents.createSuccess, ({ payload }, state) => {
        const collectionsInPath = state.collections[payload.collection.path];

        return {
          ...setFulfilled(collectionStatusNames.details),
          collections: {
            ...state.collections,
            [payload.collection.path]: collectionsInPath
              ? [...collectionsInPath, payload.collection]
              : [payload.collection],
          },
        };
      }),

      on(collectionApiEvents.updateSuccess, ({ payload }, state) => {
        const collectionsInPath = state.collections[payload.collection.path];

        if (!collectionsInPath) {
          throw new Error("not exist collections with path: " + payload.collection.path);
        }

        const collectionToUpdate = collectionsInPath.find(
          collection => collection.id === payload.collection.id
        );

        if (!collectionToUpdate) {
          throw new Error("not exist collection with id: " + payload.collection.id);
        }

        return {
          ...setFulfilled(collectionStatusNames.details),
          collections: {
            ...state.collections,
            [payload.collection.path]: collectionsInPath.map(collection =>
              collection.id === payload.collection.id
                ? { ...payload.collection, updatedAt: new Date() }
                : collection
            ),
          },
        };
      }),

      on(collectionApiEvents.deleteSuccess, ({ payload }, state) => {
        const collectionsInPath = state.collections[payload.path];

        if (!collectionsInPath) {
          throw new Error("not exist collections with path: " + payload.path);
        }

        const collectionToDelete = collectionsInPath.find(
          collection => collection.id === payload.id
        );

        if (!collectionToDelete) {
          throw new Error("not exist collection with id: " + payload.id);
        }

        return {
          ...setFulfilled(collectionStatusNames.details),
          collections: {
            ...state.collections,
            [payload.path]: collectionsInPath.filter(
              collection => collection.id !== payload.id
            ),
          },
        };
      }),

      on(
        collectionApiEvents.createFailed,
        collectionApiEvents.deleteFailed,
        collectionApiEvents.updateFailed,
        collectionApiEvents.moveFailed,
        ({ payload }, state) => ({
          ...state,
          ...setError(payload.error, collectionStatusNames.details),
        })
      ),

      on(collectionApiEvents.loadFailed, ({ payload }, state) => ({
        ...state,
        ...setError(payload.error, collectionStatusNames.list),
      })),

      // // Move collection success
      // on(collectionApiEvents.moveSuccess, ({ payload }, state) => ({
      //   ...state,
      //   collections: state.collections.map(collection =>
      //     collection.id === payload.collection.id
      //       ? { ...payload.collection, updatedAt: new Date() }
      //       : collection
      //   ),
      // })),

      // // Load collections success
      // on(collectionApiEvents.loadSuccess, ({ payload }, state) => ({
      //   ...state,
      //   collections: payload.collections,
      // })),

      // Reset collections
      on(collectionEvents.reset, () => ({
        collections: {},
      }))
    )
  );
}
