import { CommonModule } from "@angular/common";
import { Component, computed, inject, input, linkedSignal, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import {
  createChevronRotateAnimation,
  createExpandCollapseAnimation,
  expandCollapseState,
} from "@client/web-shared-constants";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideFolder, lucideFolderOpen } from "@ng-icons/lucide";
import { CollectionTreeService } from "../collection-tree/collection-tree.service";

@Component({
  selector: "mc-collection-node",
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideFolder,
      lucideFolderOpen,
    }),
  ],
  templateUrl: "./collection-node.html",
  styleUrl: "./collection-node.css",
  animations: [
    createChevronRotateAnimation({
      name: "chevronRotate",
    }),
    createExpandCollapseAnimation({
      name: "expandCollapse",
    }),
  ],
})
export class MCCollectionNode {
  private readonly _collectionTreeService = inject(CollectionTreeService);

  readonly $node = input.required<Collection>({ alias: "node" });
  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });

  readonly $isSidebarCollapsed = signal(false);
  readonly $isCollapsed = signal(true);
  readonly $items = computed(() => {
    const node = this.$node();
    const tree = this.$tree();

    return tree[node.path] || [];
  });

  readonly $isDisplayItems = linkedSignal(() => {
    return this.$items().length > 0;
  });

  readonly $collapseState = linkedSignal(() => {
    return this.$isCollapsed()
      ? expandCollapseState.collapsed
      : expandCollapseState.expanded;
  });

  onToggleCollapse(): void {
    const collapsed = !this.$isCollapsed();
    this.$isCollapsed.set(collapsed);

    if (collapsed) {
      this._collectionTreeService.expand(this.$node());
    }
  }
}
