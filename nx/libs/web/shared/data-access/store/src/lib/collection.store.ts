import { computed } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { CollectionVM, Identity } from "@nx/web-shared-models";
import { clamp, injectParams } from "@nx/web-shared-utils";

type CollectionState = {
  items: CollectionVM[];
};

const initialState: CollectionState = {
  items: [],
};

export const CollectionStore = signalStore(
  withState(initialState),
  withComputed(store => {
    const $params = injectParams();
    const $items = computed(() => store.items());
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
    return {
      setItems: (items: CollectionVM[]) => {
        patchState(store, { items });
      },
      addItem: (itemToAdd: CollectionVM) => {
        const newItems = [...store.items(), itemToAdd];
        patchState(store, { items: newItems });
      },
      updateItem: (id: Identity, itemToUpdate: Partial<CollectionVM>) => {
        const newItems = store.items().map(item => {
          if (item.id === id) {
            return { ...item, ...itemToUpdate };
          }
          return item;
        });
        patchState(store, { items: newItems });
      },
      deleteItem: (id: Identity) => {
        const newItems = store.items().filter(item => item.id !== id);
        patchState(store, { items: newItems });
      },
      move: (fromIndex: number, toIndex: number) => {
        const newEntities = structuredClone(store.items());
        const from = clamp(fromIndex, newEntities.length - 1);
        const to = clamp(toIndex, newEntities.length - 1);

        if (from === to) {
          return;
        }

        const target = newEntities[from];
        const delta = to < from ? -1 : 1;

        for (let i = from; i !== to; i += delta) {
          newEntities[i] = newEntities[i + delta];
        }

        newEntities[to] = target;

        patchState(store, { items: newEntities });
      },
    };
  })
);
