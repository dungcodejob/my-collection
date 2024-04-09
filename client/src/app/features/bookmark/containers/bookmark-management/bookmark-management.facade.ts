import { Injectable, Injector, computed, effect, inject, untracked } from "@angular/core";
import { BookmarkStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";
import { ShellFacade } from "@shell/data-access";

@Injectable()
export class BookmarkFacade {
  private readonly _injector = inject(Injector);
  private readonly _bookmarkStore = inject(BookmarkStore);
  private readonly _shellFacade = inject(ShellFacade);
  private readonly _collectionFacade = inject(CollectionFacade);

  $entities = this._bookmarkStore.entities;
  $collection = computed(() => this._collectionFacade.$selectedEntity());

  enter() {
    effect(
      () => {
        const collectionId = this.$collection()?.id;

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

  private _load(collectionId: string) {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll(collectionId);
  }
}
