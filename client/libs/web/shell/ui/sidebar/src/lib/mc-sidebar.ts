import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";
import { MenuItem, NavItemComponent } from "./nav-item.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBookmark, lucideChevronRight, lucideChevronLeft } from '@ng-icons/lucide';

@Component({
  selector: "mc-sidebar",
  imports: [ButtonModule, TooltipModule, RippleModule, NavItemComponent, NgIconComponent],
  providers: [provideIcons({ lucideBookmark, lucideChevronRight, lucideChevronLeft })],
  templateUrl: "./mc-sidebar.html",
  styleUrl: "./mc-sidebar.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCSidebar {
  protected readonly isCollapsed = signal(false);

  protected readonly menuItems: readonly MenuItem[] = [];

  protected toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  protected onMenuItemClick(item: MenuItem): void {
    // Handle navigation logic here
    console.log("Navigate to:", item.url);
  }
}
