import { Component, effect, inject, input, output } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import { MCCollectionNode } from "../collection-node/collection-node";
import { CollectionTreeService } from "./collection-tree.service";

@Component({
  selector: "mc-collection-tree",
  imports: [MCCollectionNode],
  providers: [CollectionTreeService],
  templateUrl: "./collection-tree.html",
  styleUrl: "./collection-tree.css",
})
export class MCCollectionTree {
  private readonly _collectionTreeService = inject(CollectionTreeService);

  readonly $root = input.required<Collection>({ alias: "node" });
  readonly $isDisplayRoot = input(true, { alias: "isDisplayRoot" });

  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });
  readonly $items = this._collectionTreeService.getNodeChildren(this.$root);

  readonly nodeExpand = output<Collection>();

  constructor() {
    effect(() => {
      const node = this._collectionTreeService.$expandedNode();
      if (node) {
        this.nodeExpand.emit(node);
      }
    });

    effect(() => {
      const tree = this.$tree();
      this._collectionTreeService.setTree(tree);
    });
  }
}
