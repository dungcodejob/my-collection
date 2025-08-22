import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";
import {
  Collection,
  CollectionFilter,
  CreateCollectionRequest,
  MoveCollectionRequest,
  UpdateCollectionRequest,
} from "../models";

export const collectionEvents = eventGroup({
  source: "Collection",
  events: {
    create: type<{ request: CreateCollectionRequest }>(),
    update: type<{ request: UpdateCollectionRequest }>(),
    delete: type<{ request: { id: string; path: string } }>(),
    move: type<{ request: MoveCollectionRequest }>(),
    load: type<{ filter: CollectionFilter }>(),
    reset: type<void>(),
  },
});

export const collectionApiEvents = eventGroup({
  source: "Collection API",
  events: {
    createSuccess: type<{ path: string; collection: Collection }>(),
    createFailed: type<{ error: unknown }>(),
    updateSuccess: type<{ collection: Collection }>(),
    updateFailed: type<{ error: unknown }>(),
    deleteSuccess: type<{ id: string; path: string }>(),
    deleteFailed: type<{ error: unknown }>(),
    moveSuccess: type<{ collection: Collection }>(),
    moveFailed: type<{ error: unknown }>(),
    loadSuccess: type<{ path: string; collections: Collection[] }>(),
    loadFailed: type<{ error: unknown }>(),
  },
});
