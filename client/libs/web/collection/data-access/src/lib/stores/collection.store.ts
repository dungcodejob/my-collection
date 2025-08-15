import { NamedStatusState, withStatus } from "@client/web-shared-utils";
import { signalStore, withHooks, withState } from "@ngrx/signals";
import { Collection } from "../models/collection";
import { withCollectionEffects } from "./collection.effects";
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
} as const;

export type CollectionState = {
  collections: {
    [path: string]: Collection[];
  };
  root: Collection;
};

export type CollectionStateWithFeature = CollectionState &
  NamedStatusState<typeof collectionStatusNames.list> &
  NamedStatusState<typeof collectionStatusNames.details>;

const initialState: CollectionState = {
  collections: {},
  root: COLLECTION_ROOT,
};

export const CollectionStore = signalStore(
  withState(initialState),
  withStatus({
    names: [collectionStatusNames.list, collectionStatusNames.details],
  }),

  // withCallState({ collection: collectionStatusNames.details }),
  withCollectionReducer(),
  withCollectionEffects(),
  withHooks({
    onInit: () => {
      console.log("CollectionStore onInit");
    },
  })
);
