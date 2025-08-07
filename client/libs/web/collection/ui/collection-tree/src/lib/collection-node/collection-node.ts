import { Component, computed, inject, input, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideFolder, lucideFolderOpen } from "@ng-icons/lucide";
import { CollectionTreeService } from "../collection-tree/collection-tree.service";

@Component({
  selector: "mc-collection-node",
  imports: [NgIconComponent],
  providers: [
    provideIcons({
      lucideFolder,
      lucideFolderOpen,
    }),
  ],
  templateUrl: "./collection-node.html",
  styleUrl: "./collection-node.css",
})
export class MCCollectionNode {
  private readonly _collectionTreeService = inject(CollectionTreeService);

  readonly $node = input.required<Collection>({ alias: "node" });
  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });

  readonly $isExpanded = signal(false);
  readonly $items = computed(() => {
    const node = this.$node();
    const tree = this.$tree();

    console.log(node.path);
    console.log(tree);

    return tree[node.path] || [];
  });

  readonly $isDisplayItems = computed(() => {
    return this.$items().length > 0;
  });

  onToggleExpand(): void {
    const expanded = !this.$isExpanded();
    this.$isExpanded.set(expanded);

    if (expanded) {
      this._collectionTreeService.expand(this.$node());
    }
  }
}
