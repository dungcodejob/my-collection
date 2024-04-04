import { Injectable, inject } from "@angular/core";
import { CollectionStore } from "@collection/data-access";

@Injectable()
export class CollectionFacade {
  private readonly _collectionStore = inject(CollectionStore);

  $entities = this._collectionStore.entities;

  enter(): void {
    this._collectionStore.findAll();
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
}
