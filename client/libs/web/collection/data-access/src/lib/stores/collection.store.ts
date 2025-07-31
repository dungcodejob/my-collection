import { NamedStatusState, withStatus } from "@client/web-shared-utils";
import { signalStore, withHooks, withState } from "@ngrx/signals";
import { Collection } from "../models/collection";
import { withCollectionEffects } from "./collection.effects";
import { withCollectionReducer } from "./collection.reducer";

export const collectionStatusNames = {
  list: "list",
  details: "details",
} as const;

export type CollectionState = {
  collections: {
    [path: string]: Collection[];
  };
};

export type CollectionStateWithFeature = CollectionState &
  NamedStatusState<typeof collectionStatusNames.list> &
  NamedStatusState<typeof collectionStatusNames.details>;

const initialState: CollectionState = {
  collections: {},
};

export const CollectionStore = signalStore(
  withState(initialState),
  withStatus(),

  withCollectionReducer(),
  withCollectionEffects(),
  withHooks({
    onInit: () => {
      console.log("CollectionStore onInit");
    },
  })
);
