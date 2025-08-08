import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
import {
  createChevronRotateAnimation,
  createExpandCollapseAnimation,
} from "@client/web-shared-constants";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideChevronRight } from "@ng-icons/lucide";
import type { MenuItem } from "../sidebar";
@Component({
  selector: "mc-nav-group",
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ lucideChevronDown, lucideChevronRight })],
  animations: [
    createChevronRotateAnimation({
      name: "chevronRotate",
    }),
    createExpandCollapseAnimation({
      name: "expandCollapse",
    }),
  ],
  templateUrl: "./nav-group.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCNavGroupComponent {
  readonly title = input<string>();
  readonly items = input.required<MenuItem[]>();
  readonly isSidebarCollapsed = input.required<boolean>();

  private readonly _expandedItems = signal<Set<string>>(new Set());

  protected isDisplay(itemId: string): boolean {
    return this._expandedItems().has(itemId);
  }

  protected toggleExpanded(itemId: string): void {
    this._expandedItems.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  }

  protected getSubmenuState(itemId: string): string {
    return this.isDisplay(itemId) ? "expanded" : "collapsed";
  }
}
