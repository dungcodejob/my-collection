import { Component, inject, input, output } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import { injectAutoEffect } from "@client/web-shared-utils";
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
  private readonly _autoEffect = injectAutoEffect();

  readonly $root = input.required<Collection>({ alias: "node" });
  readonly $isDisplayRoot = input(true, { alias: "isDisplayRoot" });

  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });
  readonly $items = this._collectionTreeService.getNodeChildren(this.$root);

  readonly nodeExpand = output<Collection>();
  readonly nodeUpdate = output<Collection>();
  readonly nodeDelete = output<Collection>();
  readonly nodeSelect = output<Collection>();

  constructor() {
    this.loadEffect();
    this.updateEffect();
    this.deleteEffect();
    this.expandEffect();
    this.selectEffect();
  }

  private loadEffect(): void {
    this._autoEffect(() => {
      const tree = this.$tree();
      this._collectionTreeService.setTree(tree);
    });
  }

  private updateEffect(): void {
    this._autoEffect(() => {
      const node = this._collectionTreeService.$updateNode();
      if (node) {
        this.nodeUpdate.emit(node);
      }
    });
  }

  private deleteEffect(): void {
    this._autoEffect(() => {
      const node = this._collectionTreeService.$deleteNode();
      if (node) {
        this.nodeDelete.emit(node);
      }
    });
  }

  private expandEffect(): void {
    this._autoEffect(() => {
      const node = this._collectionTreeService.$expandedNode();
      if (node) {
        this.nodeExpand.emit(node);
      }
    });
  }

  private selectEffect(): void {
    this._autoEffect(() => {
      const node = this._collectionTreeService.$selectedNode();
      if (node) {
        this.nodeSelect.emit(node);
      }
    });
  }
}
