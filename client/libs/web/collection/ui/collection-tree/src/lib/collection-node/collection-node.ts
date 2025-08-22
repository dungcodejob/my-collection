import { Component, computed, inject, input, linkedSignal, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import {
  createChevronRotateAnimation,
  createExpandCollapseAnimation,
  expandCollapseState,
} from "@client/web-shared-constants";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideEllipsisVertical,
  lucideFolder,
  lucideFolderOpen,
  lucidePencilLine,
} from "@ng-icons/lucide";
import { BrnMenuModule } from "@spartan-ng/brain/menu";
import { HlmButtonModule } from "@spartan-ng/helm/button";
import { HlmIconModule } from "@spartan-ng/helm/icon";
import { HlmMenuModule } from "@spartan-ng/helm/menu";
import { CollectionTreeService } from "../collection-tree/collection-tree.service";
@Component({
  selector: "mc-collection-node",
  imports: [HlmButtonModule, HlmIconModule, NgIcon, HlmMenuModule, BrnMenuModule],
  providers: [
    provideIcons({
      lucideFolder,
      lucideFolderOpen,
      lucideEllipsisVertical,
      lucidePencilLine,
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
  readonly $items = this._collectionTreeService.getNodeChildren(this.$node);
  readonly $isSidebarCollapsed = signal(false);
  readonly $isCollapsed = signal(true);
  readonly $isHasChild = computed(() => {
    return this.$node().isHasChild;
  });

  readonly $collapseState = linkedSignal(() => {
    return this.$isCollapsed()
      ? expandCollapseState.collapsed
      : expandCollapseState.expanded;
  });

  onToggleCollapse(): void {
    const collapsed = !this.$isCollapsed();
    this.$isCollapsed.set(collapsed);

    if (!collapsed) {
      this._collectionTreeService.expand(this.$node());
    }
  }

  onSelect(): void {
    this._collectionTreeService.select(this.$node());
  }

  onUpdate(): void {
    this._collectionTreeService.update(this.$node());
  }

  onDelete(): void {
    this._collectionTreeService.delete(this.$node());
  }
}
