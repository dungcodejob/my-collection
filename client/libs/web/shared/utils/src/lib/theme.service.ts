import { DOCUMENT, effect, inject, Injectable, signal } from "@angular/core";

export type ThemeMode = "light" | "dark" | "auto";
export type ThemePreset = "aura" | "lara" | "nora" | "material";

export interface ThemeConfig {
  mode: ThemeMode;
  preset: ThemePreset;
}

@Injectable()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _storageKey = "app-theme-config";

  // Signals for reactive theme management
  readonly themeMode = signal<ThemeMode>("auto");
  readonly themePreset = signal<ThemePreset>("aura");
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    // Load saved theme configuration
    this.loadThemeConfig();

    // Effect to apply theme changes
    effect(() => {
      this.applyTheme();
    });

    // Listen for system theme changes
    this.listenToSystemTheme();
  }

  /**
   * Set theme mode (light, dark, auto)
   */
  setThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
    this.saveThemeConfig();
  }

  /**
   * Set theme preset (aura, lara, nora, material)
   */
  setThemePreset(preset: ThemePreset): void {
    this.themePreset.set(preset);
    this.saveThemeConfig();
  }

  /**
   * Toggle between light and dark mode
   */
  toggleThemeMode(): void {
    const currentMode = this.themeMode();
    if (currentMode === "auto") {
      this.setThemeMode("light");
    } else if (currentMode === "light") {
      this.setThemeMode("dark");
    } else {
      this.setThemeMode("auto");
    }
  }

  /**
   * Get current theme configuration
   */
  getThemeConfig(): ThemeConfig {
    return {
      mode: this.themeMode(),
      preset: this.themePreset(),
    };
  }

  private applyTheme(): void {
    const mode = this.themeMode();
    const preset = this.themePreset();

    // Determine if dark mode should be active
    let isDark = false;
    if (mode === "dark") {
      isDark = true;
    } else if (mode === "auto") {
      isDark = this.getSystemThemePreference();
    }

    this.isDarkMode.set(isDark);

    // Apply theme classes to document
    const htmlElement = this._document.documentElement;

    // Remove existing theme classes
    htmlElement.classList.remove("light", "dark");
    htmlElement.classList.remove("aura", "lara", "nora", "material");

    // Add current theme classes
    htmlElement.classList.add(isDark ? "dark" : "light");
    htmlElement.classList.add(preset);

    // Update CSS custom properties for theme
    this.updateCSSVariables(isDark, preset);
  }

  private updateCSSVariables(isDark: boolean, preset: ThemePreset): void {
    const root = this._document.documentElement;

    // Base theme variables
    if (isDark) {
      root.style.setProperty("--surface-ground", "#0e1419");
      root.style.setProperty("--surface-section", "#14181c");
      root.style.setProperty("--surface-card", "#1a1d21");
      root.style.setProperty("--text-color", "#ffffff");
      root.style.setProperty("--text-color-secondary", "#9ca3af");
      root.style.setProperty("--primary-color", "#3b82f6");
    } else {
      root.style.setProperty("--surface-ground", "#ffffff");
      root.style.setProperty("--surface-section", "#f8fafc");
      root.style.setProperty("--surface-card", "#ffffff");
      root.style.setProperty("--text-color", "#1f2937");
      root.style.setProperty("--text-color-secondary", "#6b7280");
      root.style.setProperty("--primary-color", "#3b82f6");
    }
  }

  private getSystemThemePreference(): boolean {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }

  private listenToSystemTheme(): void {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        if (this.themeMode() === "auto") {
          this.applyTheme();
        }
      });
    }
  }

  private loadThemeConfig(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem(this._storageKey);
        if (saved) {
          const config: ThemeConfig = JSON.parse(saved);
          this.themeMode.set(config.mode);
          this.themePreset.set(config.preset);
        }
      } catch (error) {
        console.warn("Failed to load theme configuration:", error);
      }
    }
  }

  private saveThemeConfig(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const config: ThemeConfig = {
          mode: this.themeMode(),
          preset: this.themePreset(),
        };
        localStorage.setItem(this._storageKey, JSON.stringify(config));
      } catch (error) {
        console.warn("Failed to save theme configuration:", error);
      }
    }
  }
}
