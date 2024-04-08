import { Injectable, Injector, computed, inject } from "@angular/core";
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
  $collectionTitle = computed(() => this._collectionFacade.$selectedEntity()?.title);

  enter() {

  }

  load(collectionId: string) {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll(collectionId);
  }
}
