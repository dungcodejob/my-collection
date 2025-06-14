import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { WebAuthFeatureLogin } from "@client/web-auth-feature-login";

@Component({
  imports: [RouterModule, WebAuthFeatureLogin],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  protected title = "client";
}
