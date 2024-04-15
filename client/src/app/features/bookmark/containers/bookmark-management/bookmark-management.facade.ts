import { Injectable, Injector, effect, inject, untracked } from "@angular/core";
import { BookmarkStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";

@Injectable()
export class BookmarkFacade {
  private readonly _injector = inject(Injector);
  private readonly _bookmarkStore = inject(BookmarkStore);
  private readonly _collectionFacade = inject(CollectionFacade);

  $entities = this._bookmarkStore.entities;
  $collection = this._collectionFacade.$selectedEntity;
  $pagination = this._bookmarkStore.$pagination;

  enter() {
    effect(
      () => {
        const collectionId = this.$collection()?.id;

        untracked(() => {
          console.log(this.$pagination());
        });

        untracked(() => {
          if (collectionId) {
            this._load(collectionId);
          }
        });
      },
      { injector: this._injector }
    );
  }

  add() {
    const collectionId = this.$collection()?.id as string;
    this._bookmarkStore.create(collectionId);
  }

  delete(id: string): void {
    this._bookmarkStore.delete(id);
  }

  private _load(collectionId: string) {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll(collectionId);
  }
}
