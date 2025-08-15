import { computed, Injectable, Signal, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";

@Injectable()
export class CollectionTreeService {
  private readonly _$expandedNode = signal<Collection | undefined>(undefined);
  private readonly _$tree = signal<{ [key: string]: Collection[] }>({});

  readonly $expandedNode = this._$expandedNode.asReadonly();

  expand(node: Collection): void {
    this._$expandedNode.set(node);
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
