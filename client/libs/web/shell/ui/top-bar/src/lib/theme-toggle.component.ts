import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ThemeMode, ThemePreset, ThemeService } from "@client/web-shared-services";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "lib-theme-toggle",
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule, TooltipModule],
  template: `
    <div class="theme-toggle-container">
      <!-- Theme Mode Toggle -->
      <p-button
        class="mr-2"
        severity="secondary"
        tooltipPosition="bottom"
        [icon]="getThemeModeIcon()"
        [label]="getThemeModeLabel()"
        [pTooltip]="'Chuyển đổi chế độ: ' + getThemeModeLabel()"
        [text]="true"
        (onClick)="toggleThemeMode()"
      />

      <!-- Theme Preset Menu -->
      <p-button
        icon="pi pi-palette"
        severity="secondary"
        tooltipPosition="bottom"
        [label]="'Theme: ' + getCurrentPresetLabel()"
        [pTooltip]="'Chọn giao diện'"
        [text]="true"
        (onClick)="menu.toggle($event)"
      />

      <p-menu #menu [model]="themePresetItems" [popup]="true" />
    </div>
  `,
  styles: [
    `
      .theme-toggle-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      :host ::ng-deep .p-button {
        border-radius: 0.5rem;
        transition: all 0.2s ease;
      }

      :host ::ng-deep .p-button:hover {
        background-color: var(--surface-hover);
      }

      :host ::ng-deep .p-menu {
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class ThemeToggleComponent {
  private readonly _themeService = inject(ThemeService);

  // Reactive signals from theme service
  protected readonly themeMode = this._themeService.mode;
  protected readonly themePreset = this._themeService.preset;
  protected readonly isDarkMode = this._themeService.isDarkMode;

  protected readonly themePresetItems: MenuItem[] = [
    {
      label: "Aura",
      icon: "pi pi-circle",
      command: () => this.setThemePreset(ThemePreset.Aura),
    },
    {
      label: "Lara",
      icon: "pi pi-circle",
      command: () => this.setThemePreset(ThemePreset.Lara),
    },
    {
      label: "Nora",
      icon: "pi pi-circle",
      command: () => this.setThemePreset(ThemePreset.Nora),
    },
    {
      label: "Material",
      icon: "pi pi-circle",
      command: () => this.setThemePreset(ThemePreset.Material),
    },
  ];

  protected toggleThemeMode(): void {
    this._themeService.toggleMode();
  }

  protected setThemePreset(preset: ThemePreset): void {
    this._themeService.setPreset(preset);
  }

  protected getThemeModeIcon(): string {
    const mode = this.themeMode();
    switch (mode) {
      case ThemeMode.Light:
        return "pi pi-sun";
      case ThemeMode.Dark:
        return "pi pi-moon";
      case ThemeMode.System:
        return "pi pi-desktop";
      default:
        return "pi pi-desktop";
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
