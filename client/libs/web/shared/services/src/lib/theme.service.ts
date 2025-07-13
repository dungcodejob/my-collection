import {
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Renderer2,
  RendererFactory2,
  signal,
  Signal,
} from "@angular/core";
import { StorageService } from "./storage.service";

export enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system",
  Default = ThemeMode.System,
}

export enum ThemePreset {
  Aura = "aura",
  Lara = "lara",
  Nora = "nora",
  Material = "material",
  Default = ThemePreset.Aura,
}

export const PREFERRED_THEME_MODE_TOKEN = new InjectionToken<Signal<ThemeMode>>(
  "PREFERRED_THEME_MODE",
  {
    providedIn: "root",
    factory: (): Signal<ThemeMode> => {
      const window = inject(DOCUMENT)?.defaultView;
      if (window === null || !window.matchMedia) {
        throw new Error("window.matchMedia is not supported");
      }

      const destroyRef = inject(DestroyRef);
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const colorMode = signal<ThemeMode>(
        mediaQuery.matches ? ThemeMode.Dark : ThemeMode.Light
      );

      const preferredColorModeChangeListener = (event: MediaQueryListEvent): void => {
        if (event.matches) {
          colorMode.set(ThemeMode.Dark);
        } else {
          colorMode.set(ThemeMode.Light);
        }
      };

      mediaQuery.addEventListener("change", preferredColorModeChangeListener);

      destroyRef.onDestroy(() =>
        mediaQuery.removeEventListener("change", preferredColorModeChangeListener)
      );

      return colorMode;
    },
  }
);

export const THEME_MODE_KEY = "theme-mode";
export const THEME_PRESET_KEY = "theme-preset";
export const THEME_DARK_MODE_CLASS = "theme-dark";

export const injectRenderer2 = (): Renderer2 =>
  inject(RendererFactory2).createRenderer(null, null);

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _render = injectRenderer2();
  private readonly _injector = inject(Injector);
  private readonly _storageService = inject(StorageService);
  private readonly _storedMode = this._storageService.form<ThemeMode>(
    THEME_MODE_KEY,
    ThemeMode.Default
  );
  private readonly _preferredMode = inject(PREFERRED_THEME_MODE_TOKEN);
  private readonly _storedPreset = this._storageService.form<ThemePreset>(
    THEME_PRESET_KEY,
    ThemePreset.Default
  );

  readonly mode = computed(() => {
    const preferred = this._preferredMode();
    const stored = this._storedMode();

    if (stored === ThemeMode.System) {
      return preferred;
    }

    return stored ?? preferred;
  });

  readonly isDarkMode = computed(() => this.mode() === ThemeMode.Dark);
  readonly preset = computed(() => this._storedPreset());

  setMode(mode: ThemeMode): void {
    this._storedMode.set(mode);
  }

  setPreset(preset: ThemePreset): void {
    this._storedPreset.set(preset);
  }

  toggleMode(): void {
    const current = this._storedMode();
    const next = current === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light;
    this.setMode(next);
  }

  initialize(): void {
    effect(() => {
      const isDarkMode = this.isDarkMode();
      if (isDarkMode) {
        this._render.addClass(this._document.body, THEME_DARK_MODE_CLASS);
      } else {
        this._render.removeClass(this._document.body, THEME_DARK_MODE_CLASS);
      }
    });
  }
}
