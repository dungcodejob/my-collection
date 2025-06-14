import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ThemeService } from "@client/web-shared-services";
import { ThemeToggleComponent } from "@client/web-shell-ui-top-bar";
import { ButtonModule } from "primeng/button";

@Component({
  imports: [RouterModule, ButtonModule, ThemeToggleComponent],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly _themeService = inject(ThemeService);
  protected title = "client";
}
