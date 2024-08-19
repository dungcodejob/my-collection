import { inject, Injectable, Injector, untracked } from "@angular/core";
import { CollectionFacade } from "@collection/data-access";
import { RootFacade } from "@shared/data-access";
import { BookmarkFilterDto } from "@shared/models";
import { injectAutoEffect } from "@shared/utils";
import { BookmarkStore } from "./bookmark.store";

@Injectable()
export class BookmarkFacade {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _injector = inject(Injector);
  private readonly _rootFacade = inject(RootFacade);
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _store = inject(BookmarkStore);

  readonly $collection = this._collectionFacade.$selectedEntity;
  readonly $items = this._store.entities;
  readonly $loading = this._store.$isListPending;
  readonly $error = this._store.$listError;
  readonly $pagination = this._store.$pagination;

  enter() {
    const $itemStatus = this._store.itemStatus;
    this._rootFacade.setStatus($itemStatus);

    this._autoEffect(() => {
      this._store.filter();
      this._store.$pagination();
      untracked(() => this._store.findAll());
    });
  }

  setFilter(filter: BookmarkFilterDto) {
    this._store.setFilter(filter);
    this._store.paginationReset();
  }

  create = this._store.create;
  edit = this._store.update;
  delete = this._store.delete;
}
