import { Injectable, inject } from "@angular/core";
import { CollectionStore } from "@collection/data-access";

@Injectable()
export class CollectionFacade {
  private readonly _collectionStore = inject(CollectionStore);

  $entities = this._collectionStore.entities;

  enter() {
    this._collectionStore.findAll();
  }

  create() {
    this._collectionStore.create();
  }

  edit(id: string) {
    this._collectionStore.edit(id);
  }
}
