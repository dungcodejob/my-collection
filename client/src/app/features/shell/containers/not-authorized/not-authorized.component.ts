import { Location } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-not-authorized",
  standalone: true,
  imports: [],
  templateUrl: "./not-authorized.component.html",
  styleUrl: "./not-authorized.component.scss",
})
export class NotAuthorizedComponent {
  private readonly _router = inject(Router);
  private readonly _location = inject(Location);
  goHome() {
    this._router.navigate(["/home"]);
  }

  goBack() {
    this._location.historyGo(-2);
    // this.#location.back();
  }
}
