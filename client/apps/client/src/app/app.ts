import { Component, inject } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { injectAppConfig } from "@client/web-core-config";
import { MCThemeService } from "@client/web-shared-services";
import { NgxSonnerToaster } from "ngx-sonner";
@Component({
  imports: [RouterModule, RouterOutlet, NgxSonnerToaster],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly _$config = injectAppConfig();
  private readonly _themeService = inject(MCThemeService);

  constructor() {
    this._themeService.initialize();
  }
}
