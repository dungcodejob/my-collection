import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ThemeService } from "@client/web-shared-services";
import { ThemeToggleComponent } from "@client/web-shell-ui-top-bar";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
@Component({
  imports: [RouterModule, HlmButtonDirective, ThemeToggleComponent],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly _themeService = inject(ThemeService);
  protected title = "client";
}
