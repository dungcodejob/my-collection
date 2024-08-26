import { Injectable, inject } from "@angular/core";

import { TagFacade } from "@shared/data-access";
import { BookmarkDetailDialogStore } from "./bookmark-detail-dialog.store";

@Injectable()
export class BookmarkDetailDialogFacade {
  private readonly _bookmarkDetailDialogStore = inject(BookmarkDetailDialogStore);
  private readonly _tagFacade = inject(TagFacade);

  $tags = this._tagFacade.$items;
  $tagResult = this._tagFacade.$tagResult;
  $metadata = this._bookmarkDetailDialogStore.metadata;
  $loading = this._bookmarkDetailDialogStore.$isPending;

  enter() {
    this._tagFacade.reset();
  }

  searchTag(keyword: string) {
    this._tagFacade.setFilter({ keyword });
    this._tagFacade.load();
  }

  createTag(title: string, collectionId: string) {
    this._tagFacade.create({ title, collectionId });
  }

  getMetadata = this._bookmarkDetailDialogStore.getMetadata;
}
