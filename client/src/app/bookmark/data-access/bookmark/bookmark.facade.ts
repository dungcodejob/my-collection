import { inject, Injectable, Signal, untracked } from "@angular/core";
import { CollectionFacade } from "@collection/data-access";
import { RootFacade, TagFacade } from "@shared/data-access";
import { BookmarkFilterVM } from "@shared/models";
import { injectAutoEffect } from "@shared/utils";
import { Observable } from "rxjs";
import { BookmarkStore } from "./bookmark.store";

type RxMethodInput<Input> = Input | Observable<Input> | Signal<Input>;
@Injectable()
export class BookmarkFacade {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _rootFacade = inject(RootFacade);
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _tagFacade = inject(TagFacade);
  private readonly _store = inject(BookmarkStore);

  readonly $collectionId = this._collectionFacade.$selectedId;
  readonly $collection = this._collectionFacade.$selectedEntity;
  readonly $bookmarkItems = this._store.entities;
  readonly $loading = this._store.$isListPending;
  readonly $error = this._store.$listError;
  readonly $pagination = this._store.$pagination;

  readonly $tagItems = this._tagFacade.$items;

  readonly $filter = this._store.filter;

  enter(filter: BookmarkFilterVM) {
    const $itemStatus = this._store.itemStatus;
    this._rootFacade.setStatus($itemStatus);

    const $collectionSelectedId = this._collectionFacade.$selectedId;
    this._store.setCollectionId($collectionSelectedId);
    this.setFilter(filter);

    this._autoEffect(() => {
      this._store.filter();
      this._store.$pagination();
      this._store.collectionId();

      untracked(() => this._store.findAll());
    });
  }

  setFilter(value: RxMethodInput<BookmarkFilterVM>) {
    this._store.setFilter(value);
  }

  create = this._store.create;
  edit = this._store.update;
  delete = this._store.delete;

  nextPage() {
    this._store.nextPage();
  }

  previousPage() {
    this._store.prevPage();
  }
}
