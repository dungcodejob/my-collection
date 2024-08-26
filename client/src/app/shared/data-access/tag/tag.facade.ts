import { Injectable, inject, untracked } from "@angular/core";
import { CollectionFacade } from "@collection/data-access";
import { injectAutoEffect } from "@shared/utils";
import { TagStore } from "./tag.store";

@Injectable()
export class TagFacade {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _store = inject(TagStore);
  private readonly _collectionFacade = inject(CollectionFacade);

  $items = this._store.entities;
  $tagResult = this._store.result;
  $filter = this._store.filter;

  enter() {
    const $collectionSelectedId = this._collectionFacade.$selectedId;
    this._store.setCollectionId($collectionSelectedId);

    this._autoEffect(() => {
      this._store.filter();
      this._store.$pagination();
      this._store.collectionId();

      untracked(() => this._store.load());
    });
  }

  load = this._store.load;
  setFilter = this._store.setFilter;
  create = this._store.create;
  reset = this._store.reset;
}
