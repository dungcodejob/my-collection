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

  readonly $node = input.required<Collection>({ alias: "node" });

  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });

  readonly nodeExpand = output<Collection>();

  constructor() {
    effect(() => {
      const node = this._collectionTreeService.$expandedNode();
      if (node) {
        this.nodeExpand.emit(node);
      }
    });
  }
}
