import { Injectable, effect, inject } from "@angular/core";
import { TagStore } from "@bookmark/data-access";
import { ToastService } from "@shared/services";

import { RootFacade } from "@shared/data-access";
import { BookmarkDetailDialogStore } from "./bookmark-detail-dialog.store";

@Injectable()
export class BookmarkDetailDialogFacade {
  private readonly _toastService = inject(ToastService);
  private readonly _rootFacade = inject(RootFacade);
  private readonly _bookmarkDetailDialogStore = inject(BookmarkDetailDialogStore);
  private readonly _tagStore = inject(TagStore);

  $tags = this._tagStore.entities;
  $tagResult = this._tagStore.result;
  $metadata = this._bookmarkDetailDialogStore.metadata;
  $loading = this._bookmarkDetailDialogStore.$isPending;

  constructor() {
    effect(() => {
      const filter = this._tagStore.filter();

      console.log(filter);
    });
  }
  enter() {
    this._tagStore.enter();
  }

  searchTag(keyword: string) {
    this._tagStore.setFilter({ keyword });
    this._tagStore.load();
  }

  createTag(title: string, collectionId: string) {
    this._tagStore.create({ title, collectionId });
  }

  getMetadata = this._bookmarkDetailDialogStore.getMetadata;
}
