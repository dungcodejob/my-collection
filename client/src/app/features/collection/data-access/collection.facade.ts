import {
  Injectable,
  Injector,
  computed,
  effect,
  inject,
  input,
  untracked,
} from "@angular/core";
import { CollectionStore } from "@collection/data-access";
import { ShellFacade } from "@shell/data-access";

@Injectable()
export class CollectionFacade {
  private readonly _injector = inject(Injector);
  private readonly _collectionStore = inject(CollectionStore);
  private readonly _shellFacade = inject(ShellFacade);

  $collectionId = input();

  $entities = this._collectionStore.entities;
  $selectedId = this._collectionStore.$selectedId;
  $selectedEntity = computed(() => {
    const entities = this.$entities();
    const selectedId = this.$selectedId();

    return entities.find(entity => entity.id === selectedId);
  });

  enter(): void {
    this._collectionStore.findAll();

    effect(
      () => {
        const collectionId = this.$collectionId();
        if (collectionId) {
          untracked(() => {
            this._collectionStore.findAll();
          });
        }
      },
      { injector: this._injector }
    );

    effect(
      () => {
        const pending = this._collectionStore.$isPending();
        untracked(() => {
          this._shellFacade.setLoading(pending);
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

  move(fromIndex: number, toIndex: number) {
    this._collectionStore.move({ fromIndex, toIndex });
  }
}
