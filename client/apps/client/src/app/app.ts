import {
  Component,
  DOCUMENT,
  effect,
  inject,
  Injector,
  OnInit,
  Renderer2,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { THEME_DARK_MODE_CLASS, ThemeService } from "@client/web-shared-services";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: "./app.css",
})
export class App implements OnInit {
  private readonly _themeService = inject(ThemeService);
  private readonly _render = inject(Renderer2);
  private readonly _document = inject(DOCUMENT);
  private readonly _injector = inject(Injector);

  constructor() {
    // this.themeService.initializeTheme();
  }

  ngOnInit(): void {
    effect(
      () => {
        const isDarkMode = this._themeService.isDarkMode();
        if (isDarkMode) {
          this._render.addClass(this._document.body, THEME_DARK_MODE_CLASS);
        } else {
          this._render.removeClass(this._document.body, THEME_DARK_MODE_CLASS);
        }
      },
      { injector: this._injector }
    );
  }
}
