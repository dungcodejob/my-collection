import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ThemeService } from "@client/web-shared-services";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMoon, lucideSun } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmIconDirective } from "@spartan-ng/helm/icon";

@Component({
  selector: "mc-mode-switcher",
  templateUrl: "./mode-switcher.component.html",
  styleUrl: "./mode-switcher.component.css",
  imports: [HlmButtonDirective, HlmIconDirective, NgIcon],
  providers: [provideIcons({ lucideSun, lucideMoon })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeSwitcherComponent {
  private readonly _themeService = inject(ThemeService);

  readonly $isDarkMode = this._themeService.isDarkMode;

  toggleTheme(): void {
    this._themeService.toggleMode();
  }

  getThemeIcon(): string {
    return this.$isDarkMode() ? "lucideSun" : "lucideMoon";
  }

  getThemeLabel(): string {
    return this.$isDarkMode() ? "Switch to light mode" : "Switch to dark mode";
  }
}
