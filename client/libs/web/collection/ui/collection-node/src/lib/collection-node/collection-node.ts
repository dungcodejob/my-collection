import { CommonModule } from "@angular/common";
import { Component, computed, input, output, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";

@Component({
  selector: "mc-collection-node",
  imports: [CommonModule],
  templateUrl: "./collection-node.html",
  styleUrl: "./collection-node.css",
})
export class MCCollectionNode {
  readonly $node = input.required<Collection>({ alias: "node" });
  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });

  readonly expand = output<Collection>();

  readonly $isExpanded = signal(false);
  readonly $items = computed(() => {
    const node = this.$node();
    const tree = this.$tree();
    return tree[node.path] || [];
  });

  readonly $isDisplayItems = computed(() => {
    return this.$items().length > 0;
  });

  onToggleExpand(): void {
    const expanded = !this.$isExpanded();
    this.$isExpanded.set(expanded);

    if (expanded) {
      this.expand.emit(this.$node());
    }
  }
}
