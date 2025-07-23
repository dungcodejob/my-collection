import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ThemeService } from "@client/web-shared-services";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMoon, lucideSun } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmIconDirective } from "@spartan-ng/helm/icon";

@Component({
  selector: "mc-mode-switcher",
  template: `
    <button
      class="group/toggle h-8 w-8 px-0"
      hlmBtn
      type="button"
      variant="ghost"
      [attr.aria-label]="getThemeLabel()"
      (click)="toggleTheme()"
    >
      @if ($isDarkMode()) {
        <ng-icon hlm name="lucideSun" size="sm" />
      } @else {
        <ng-icon hlm name="lucideMoon" size="sm" />
      }
      <span class="sr-only">Toggle theme</span>
    </button>
  `,
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
