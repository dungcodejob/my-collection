import { Injectable, Injector, effect, inject } from "@angular/core";
import { BookmarkStore, TagStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";

@Injectable()
export class BookmarkDetailFacade {
  private readonly _injector = inject(Injector);
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _bookmarkStore = inject(BookmarkStore);
  private readonly _tagStore = inject(TagStore);

  $tags = this._tagStore.entities;
  $tagResult = this._tagStore.result;
  $isDialogOpened = this._bookmarkStore.isDialogOpened;

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
    this._bookmarkStore.create({ ...data, collectionId });
  }

  searchTag(keyword: string) {
    this._tagStore.setFilter({ keyword });
    this._tagStore.load();
  }

  createTag(title: string) {
    const collectionId = this._collectionFacade.$selectedCollectionId() as string;
    this._tagStore.create({ title, collectionId });
  }
}
