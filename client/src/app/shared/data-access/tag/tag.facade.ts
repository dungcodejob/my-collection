import { Injectable, inject } from "@angular/core";
import { TagStore } from "./tag.store";

@Injectable()
export class TagFacade {
  private readonly _store = inject(TagStore);

  $tags = this._store.entities;
  $tagResult = this._store.result;
  $filter = this._store.filter;

  constructor() {
    this._store.enter();
  }
  enter() {
    this._store.enter();
  }

  load = this._store.load;
  setFilter = this._store.setFilter;
  create = this._store.create;
}
