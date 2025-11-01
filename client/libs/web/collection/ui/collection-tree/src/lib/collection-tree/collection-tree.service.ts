import { computed, Injectable, Signal, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";

@Injectable()
export class CollectionTreeService {
  private readonly _$expandedNode = signal<Collection | undefined>(undefined);
  private readonly _$updateNode = signal<Collection | undefined>(undefined);
  private readonly _$deleteNode = signal<Collection | undefined>(undefined);
  private readonly _$selectedNode = signal<Collection | undefined>(undefined);
  private readonly _$tree = signal<{ [key: string]: Collection[] }>({});

  readonly $expandedNode = this._$expandedNode.asReadonly();
  readonly $updateNode = this._$updateNode.asReadonly();
  readonly $deleteNode = this._$deleteNode.asReadonly();
  readonly $selectedNode = this._$selectedNode.asReadonly();

  expand(node: Collection): void {
    this._$expandedNode.set({ ...node });
  }

  update(node: Collection): void {
    this._$updateNode.set({ ...node });
  }

  delete(node: Collection): void {
    this._$deleteNode.set({ ...node });
  }

  select(node: Collection): void {
    this._$selectedNode.set({ ...node });
  }

  setTree(tree: { [key: string]: Collection[] }): void {
    this._$tree.set(tree);
  }

  getNodeChildren(node: Signal<Collection>): Signal<Collection[]> {
    return computed(() => {
      const tree = this._$tree();
      const collection = tree[node().path] || [];
      return collection;
    });
  }
}
