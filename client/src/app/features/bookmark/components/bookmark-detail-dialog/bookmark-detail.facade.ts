import { Injectable, Injector, effect, inject, untracked } from "@angular/core";
import { BookmarkDetailStore } from "@bookmark/data-access";
import { CollectionFacade } from "@collection/data-access";
import { UpdateBookmarkDto } from "@shared/models";
import { debouncedSignal } from "@shared/utils";
import { ShellFacade } from "@shell/data-access";

@Injectable()
export class BookmarkDetailFacade {
  private readonly _injector = inject(Injector);
  private readonly _bookmarkDetailStore = inject(BookmarkDetailStore);
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _shellFacade = inject(ShellFacade);

  $result = this._bookmarkDetailStore.result;
  $isFulfilled = this._bookmarkDetailStore.$isFulfilled;
  $loading = debouncedSignal(this._bookmarkDetailStore.$isPending, 200);

  enter() {
    this._bookmarkDetailStore.enter();
    effect(
      () => {
        const loading = this.$loading();
        untracked(() => this._shellFacade.setLoading(loading));
      },
      { injector: this._injector }
    );
  }

  add(url: string) {
    const collectionId = this._collectionFacade.$selectedEntity()?.id as string;
    this._bookmarkDetailStore.create({ url, collectionId });
  }

  update(id: string, body: UpdateBookmarkDto) {
    // TODO: implement update bookmark
  }
}
