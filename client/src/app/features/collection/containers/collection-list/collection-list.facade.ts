import { Injectable, Injector, effect, inject, untracked } from "@angular/core";
import { CollectionStore } from "@collection/data-access";
import { ShellStore } from "@shell/data-access";

@Injectable()
export class CollectionFacade {
  private readonly _injector = inject(Injector);
  private readonly _collectionStore = inject(CollectionStore);
  private readonly _layoutStore = inject(ShellStore);

  $entities = this._collectionStore.$entities;

  enter(): void {
    this._collectionStore.findAll();

    effect(
      () => {
        const pending = this._collectionStore.$isPending();
        untracked(() => {
          if (pending) {
            this._layoutStore.showLoading();
          } else {
            this._layoutStore.hideLoading();
          }
        });
      },
      { injector: this._injector }
    );
  }

  create(): void {
    this._collectionStore.create();
  }

  edit(id: string): void {
    this._collectionStore.edit(id);
  }

  delete(id: string): void {
    this._collectionStore.delete(id);
  }
}
