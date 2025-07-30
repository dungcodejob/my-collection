import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronRight, lucideMenu, lucideSearch } from "@ng-icons/lucide";
import { BrnSeparatorComponent } from "@spartan-ng/brain/separator";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmIconDirective } from "@spartan-ng/helm/icon";
import { HlmSeparatorDirective } from "@spartan-ng/helm/separator";
import { ModeSwitcherComponent } from "./mode-switcher/mode-switcher.component";
@Component({
  selector: "mc-site-header",
  templateUrl: "./site-header.component.html",
  styleUrl: "./site-header.component.css",
  imports: [
    HlmButtonDirective,
    HlmIconDirective,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    NgIcon,
    ModeSwitcherComponent,
  ],
  providers: [provideIcons({ lucideMenu, lucideSearch, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {
  readonly $sidebarOpen = signal(false);
  readonly $searchOpen = signal(false);

  toggleSidebar(): void {
    this.$sidebarOpen.update(open => !open);
    // Emit event or call service to toggle sidebar
    console.log("Toggle sidebar:", this.$sidebarOpen());
  }

  openSearch(): void {
    this.$searchOpen.set(true);
    // Open search modal or navigate to search page
    console.log("Open search");
  }
}
