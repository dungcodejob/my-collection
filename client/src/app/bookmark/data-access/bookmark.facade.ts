import { inject, Injectable, Injector, Signal, untracked } from "@angular/core";
import { CollectionFacade } from "@collection/data-access";
import { RootFacade } from "@shared/data-access";
import { BookmarkFilterDto, PaginationDto } from "@shared/models";
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

      console.log(this._store.filter());
      untracked(() => this._store.findAll());
    });
  }

  connectFilter($filter: Signal<BookmarkFilterDto>) {
    this._store.setFilter($filter);
  }

  connectPagination($pagination: Signal<PaginationDto>) {
    this._store.setPagination($pagination);
  }

  create = this._store.create;
  edit = this._store.update;
  delete = this._store.delete;
}
