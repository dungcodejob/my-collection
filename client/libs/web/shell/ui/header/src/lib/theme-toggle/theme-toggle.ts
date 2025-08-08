import { Component, inject } from "@angular/core";
import { ThemeMode, ThemePreset, ThemeService } from "@client/web-shared-services";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCircle,
  lucideMonitor,
  lucideMoon,
  lucidePalette,
  lucideSun,
} from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmIconDirective } from "@spartan-ng/helm/icon";
import { HlmMenuComponent, HlmMenuItemDirective } from "@spartan-ng/helm/menu";
import {
  HlmTooltipComponent,
  HlmTooltipTriggerDirective,
} from "@spartan-ng/helm/tooltip";

@Component({
  selector: "mc-theme-toggle",
  templateUrl: "./theme-toggle.html",
  styleUrl: "./theme-toggle.css",
  imports: [
    HlmButtonDirective,
    HlmMenuComponent,
    HlmMenuItemDirective,
    HlmTooltipComponent,
    HlmTooltipTriggerDirective,
    HlmIconDirective,
    NgIcon,
  ],
  providers: [
    provideIcons({ lucideSun, lucideMoon, lucideMonitor, lucidePalette, lucideCircle }),
  ],
})
export class MCThemeToggle {
  private readonly _themeService = inject(ThemeService);

  // Reactive signals from theme service
  protected readonly themeMode = this._themeService.mode;
  protected readonly themePreset = this._themeService.preset;
  protected readonly isDarkMode = this._themeService.isDarkMode;

  protected showPresetMenu = false;

  protected readonly themePresetItems = [
    {
      label: "Aura",
      preset: ThemePreset.Aura,
    },
    {
      label: "Lara",
      preset: ThemePreset.Lara,
    },
    {
      label: "Nora",
      preset: ThemePreset.Nora,
    },
    {
      label: "Material",
      preset: ThemePreset.Material,
    },
  ];

  protected toggleThemeMode(): void {
    this._themeService.toggleMode();
  }

  protected setThemePreset(preset: ThemePreset): void {
    this._themeService.setPreset(preset);
  }

  protected togglePresetMenu(): void {
    this.showPresetMenu = !this.showPresetMenu;
  }

  protected selectPreset(preset: ThemePreset): void {
    this.setThemePreset(preset);
    this.showPresetMenu = false;
  }

  protected getThemeModeIcon(): string {
    const mode = this.themeMode();
    switch (mode) {
      case ThemeMode.Light:
        return "lucideSun";
      case ThemeMode.Dark:
        return "lucideMoon";
      case ThemeMode.System:
        return "lucideMonitor";
      default:
        return "lucideMonitor";
    }
  }

  protected getThemeModeLabel(): string {
    const mode = this.themeMode();
    switch (mode) {
      case ThemeMode.Light:
        return "Sáng";
      case ThemeMode.Dark:
        return "Tối";
      case ThemeMode.System:
        return "Tự động";
      default:
        return "Tự động";
    }
  }

  protected getCurrentPresetLabel(): string {
    const preset = this.themePreset();
    switch (preset) {
      case ThemePreset.Aura:
        return "Aura";
      case ThemePreset.Lara:
        return "Lara";
      case ThemePreset.Nora:
        return "Nora";
      case ThemePreset.Material:
        return "Material";
      default:
        return "Aura";
    }
  }
}
