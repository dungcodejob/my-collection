import { Injectable, Injector, effect, inject, untracked } from "@angular/core";
import { TagStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";
import { BookmarkManagementStore } from "./bookmark-management.store";

@Injectable()
export class BookmarkManagementFacade {
  private readonly _injector = inject(Injector);
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _bookmarkStore = inject(BookmarkManagementStore);
  private readonly _tagStore = inject(TagStore);

  $collection = this._collectionFacade.$selectedEntity;
  $loading = this._bookmarkStore.$isPending;
  $bookmarks = this._bookmarkStore.entities;
  $pagination = this._bookmarkStore.$pagination;
  enter() {
    effect(
      () => {
        const collectionId = this._collectionFacade.$selectedCollectionId();

        untracked(() => {
          if (collectionId) {
            this._tagStore.setFilter({ collectionId });
            this._bookmarkStore.setFilter({ collectionId });
            this._load();
          }
        });
      },
      { injector: this._injector }
    );
  }

  create = this._bookmarkStore.create;
  edit = this._bookmarkStore.update;
  delete = this._bookmarkStore.delete;

  private _load() {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll();
  }
}
