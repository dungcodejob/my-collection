import { Injectable, Injector, computed, effect, inject, untracked } from "@angular/core";
import { BookmarkStore, TagStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";
import { debouncedSignal } from "@shared/utils";
import { ShellFacade } from "@shell/data-access";

@Injectable()
export class BookmarkFacade {
  private readonly _injector = inject(Injector);
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _shellFacade = inject(ShellFacade);
  private readonly _bookmarkStore = inject(BookmarkStore);
  private readonly _tagStore = inject(TagStore);

  private readonly _$layoutLoading = debouncedSignal(
    this._bookmarkStore.$isLayoutPending
  );

  $collection = this._collectionFacade.$selectedEntity;
  $isDialogOpened = this._bookmarkStore.isDialogOpened;
  $fetchLoading = this._bookmarkStore.$isFetchPending;

  $bookmarks = this._bookmarkStore.entities;
  $bookmarkSelected = computed(() => {
    const bookmarks = this.$bookmarks();
    const selectedId = this._bookmarkStore.selectedId();
    return bookmarks.find(item => item.id === selectedId);
  });
  $pagination = this._bookmarkStore.$pagination;

  enter() {
    effect(
      () => {
        const collectionId = this._collectionFacade.$selectedCollectionId();

        untracked(() => {
          if (collectionId) {
            this._tagStore.setFilter({ collectionId });
            this._bookmarkStore.setFilter({ collectionId });
            this._load();
          }
        });
      },
      { injector: this._injector }
    );

    effect(
      () => {
        const pending = this._$layoutLoading();
        untracked(() => {
          this._shellFacade.setLoading(pending);
        });
      },
      { injector: this._injector }
    );
  }

  setDialogOpened = this._bookmarkStore.setDialogOpened;

  delete = this._bookmarkStore.delete;

  private _load() {
    this._bookmarkStore.paginationReset();
    this._bookmarkStore.findAll();
  }
}
