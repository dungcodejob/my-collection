import { Injectable, Injector, computed, inject } from "@angular/core";
import { CollectionStore } from "@collection/data-access";
import { RootFacade } from "@shared/data-access";

@Injectable()
export class CollectionFacade {
  private readonly _injector = inject(Injector);
  private readonly _collectionStore = inject(CollectionStore);
  private readonly _rootFacade = inject(RootFacade);

  $items = this._collectionStore.entities;
  $selectedId = this._collectionStore.$selectedCollectionId;
  $selectedEntity = computed(() => {
    const entities = this.$items();
    const selectedId = this.$selectedId();

    return entities.find(entity => entity.id === selectedId);
  });

  enter(): void {
    this._collectionStore.findAll();

    const $status = this._collectionStore.status;
    this._rootFacade.setStatus($status);
  }

  create(): void {
    this._collectionStore.create();
  }

  edit(id: string): void {
    this._collectionStore.edit(id);
  }

  delete(id: string): void {
    this._collectionStore.delete(id);
  }

  move(fromIndex: number, toIndex: number) {
    this._collectionStore.move({ fromIndex, toIndex });
  }
}
