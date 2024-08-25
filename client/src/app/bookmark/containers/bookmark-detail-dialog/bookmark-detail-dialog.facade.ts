import { Injectable, effect, inject } from "@angular/core";
import { ToastService } from "@shared/services";

import { RootFacade, TagFacade } from "@shared/data-access";
import { BookmarkDetailDialogStore } from "./bookmark-detail-dialog.store";

@Injectable()
export class BookmarkDetailDialogFacade {
  private readonly _toastService = inject(ToastService);
  private readonly _rootFacade = inject(RootFacade);
  private readonly _bookmarkDetailDialogStore = inject(BookmarkDetailDialogStore);
  private readonly _tagFacade = inject(TagFacade);

  $tags = this._tagFacade.$tags;
  $tagResult = this._tagFacade.$tagResult;
  $metadata = this._bookmarkDetailDialogStore.metadata;
  $loading = this._bookmarkDetailDialogStore.$isPending;

  constructor() {
    effect(() => {
      const filter = this._tagFacade.$filter();

      console.log(filter);
    });
  }
  enter() {
    this._tagFacade.enter();
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
