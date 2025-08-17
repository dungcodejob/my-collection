import { Component, inject } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { injectAppConfig } from "@client/web-core-config";
import { ThemeService } from "@client/web-shared-services";
@Component({
  imports: [RouterModule, RouterOutlet],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly _$config = injectAppConfig();
  private readonly _themeService = inject(ThemeService);

  constructor() {
    this._themeService.initialize();
  }
}
