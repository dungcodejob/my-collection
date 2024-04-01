import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "@core/auth";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  private readonly _authService = inject(AuthService);
  title = "my-collection";
}
