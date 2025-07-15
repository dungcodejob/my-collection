import { Component, inject } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { ThemeService } from "@client/web-shared-services";
@Component({
  imports: [RouterModule, RouterOutlet],
  selector: "app-root",
  template: `<router-outlet />`,
  styleUrl: "./app.css",
})
export class App {
  private readonly _themeService = inject(ThemeService);

  constructor() {
    // this.themeService.initializeTheme();
  }
}
