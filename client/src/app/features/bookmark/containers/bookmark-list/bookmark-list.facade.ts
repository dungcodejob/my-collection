import { Injectable, Injector, inject } from "@angular/core";
import { BookmarkStore } from "@bookmark/data-access";
import { ShellFacade } from "@shell/data-access";

@Injectable()
export class BookmarkFacade {
  private readonly _injector = inject(Injector);
  private readonly _bookmarkStore = inject(BookmarkStore);
  private readonly _shellFacade = inject(ShellFacade);

  $entities = this._bookmarkStore.entities;

  load(collectionId: string) {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll(collectionId);
  }
}
