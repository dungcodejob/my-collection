import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronRight, lucideMenu, lucideSearch } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSeparator, HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { MCModeSwitcher } from "./mode-switcher/mode-switcher";
@Component({
  selector: "mc-site-header",
  templateUrl: "./header.html",
  styleUrl: "./header.css",
  imports: [
    HlmButton,
    HlmIconImports,
    HlmSeparatorImports,
    HlmSeparator,
    NgIcon,
    MCModeSwitcher,
  ],
  providers: [provideIcons({ lucideMenu, lucideSearch, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCHeader {
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
