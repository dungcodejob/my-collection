import { Injectable, effect, inject } from "@angular/core";
import { TagStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";
import { ToastService } from "@shared/services";
import { ShellFacade } from "@shell/data-access";
import { BookmarkManagementFacade } from "../bookmark-management/bookmark-management.facade";
import { BookmarkDetailDialogStore } from "./bookmark-detail-dialog.store";

@Injectable()
export class BookmarkDetailDialogFacade {
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _bookmarkManagementFacade = inject(BookmarkManagementFacade);
  private readonly _toastService = inject(ToastService);
  private readonly _shellFacade = inject(ShellFacade);
  private readonly _bookmarkDetailDialogStore = inject(BookmarkDetailDialogStore);
  private readonly _tagStore = inject(TagStore);

  $tags = this._tagStore.entities;
  $tagResult = this._tagStore.result;
  $metadata = this._bookmarkDetailDialogStore.metadata;
  $result = this._bookmarkDetailDialogStore.result;
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

  add(data: { url: string; tagIds: string[] }) {
    const collectionId = this._collectionFacade.$selectedCollectionId() as string;
    this._bookmarkManagementFacade.create({ ...data, collectionId });
  }

  searchTag(keyword: string) {
    this._tagStore.setFilter({ keyword });
    this._tagStore.load();
  }

  createTag(title: string) {
    const collectionId = this._collectionFacade.$selectedCollectionId() as string;
    this._tagStore.create({ title, collectionId });
  }

  getMetadata = this._bookmarkDetailDialogStore.getMetadata;
}
