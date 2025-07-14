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
  selector: "lib-theme-toggle",
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
  template: `
    <div class="theme-toggle-container">
      <!-- Theme Mode Toggle -->
      <hlm-tooltip>
        <button
          class="mr-2"
          hlmBtn
          hlmTooltipTrigger
          size="sm"
          type="button"
          variant="ghost"
          [hlmTooltipTrigger]="'Chuyển đổi chế độ: ' + getThemeModeLabel()"
          (click)="toggleThemeMode()"
        >
          <ng-icon class="mr-2" hlm [name]="getThemeModeIcon()" />
          {{ getThemeModeLabel() }}
        </button>
      </hlm-tooltip>

      <!-- Theme Preset Menu -->
      <hlm-tooltip>
        <button
          hlmBtn
          hlmTooltipTrigger
          size="sm"
          type="button"
          variant="ghost"
          [hlmTooltipTrigger]="'Chọn giao diện'"
          (click)="togglePresetMenu()"
        >
          <ng-icon class="mr-2" hlm name="lucidePalette" />
          Theme: {{ getCurrentPresetLabel() }}
        </button>
      </hlm-tooltip>

      @if (showPresetMenu) {
        <hlm-menu class="absolute top-full right-0 mt-1 z-50">
          @for (item of themePresetItems; track item.label) {
            <button hlmMenuItem type="button" (click)="selectPreset(item.preset)">
              <ng-icon class="mr-2" hlm name="lucideCircle" />
              {{ item.label }}
            </button>
          }
        </hlm-menu>
      }
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
