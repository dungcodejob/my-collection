import { Injectable, Injector, effect, inject, untracked } from "@angular/core";
import { BookmarkStore, TagStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";

@Injectable()
export class BookmarkFacade {
  private readonly _injector = inject(Injector);
  private readonly _bookmarkStore = inject(BookmarkStore);
  private readonly _tagStore = inject(TagStore);
  private readonly _collectionFacade = inject(CollectionFacade);

  $entities = this._bookmarkStore.entities;
  $collection = this._collectionFacade.$selectedEntity;
  $pagination = this._bookmarkStore.$pagination;

  enter() {
    effect(
      () => {
        const collection = this.$collection();

        untracked(() => {
          if (collection) {
            this._tagStore.setFilter({ collectionId: collection.id });
            this._load(collection.id);
          }
        });
      },
      { injector: this._injector }
    );
  }

  add = this._bookmarkStore.create;

  delete = this._bookmarkStore.delete;

  private _load(collectionId: string) {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll(collectionId);
  }
}
