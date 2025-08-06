import { Component, input, output } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import { MCCollectionNode } from "@client/web-collection-ui-node";

@Component({
  selector: "mc-collection-tree",
  imports: [MCCollectionNode],
  templateUrl: "./collection-tree.html",
  styleUrl: "./collection-tree.css",
})
export class MCCollectionTree {
  readonly $node = input.required<Collection>({ alias: "node" });

  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });

  readonly expand = output<Collection>();
}
