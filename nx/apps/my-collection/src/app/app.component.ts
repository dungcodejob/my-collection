import { Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppConfigService } from "@nx/web-shared-app-config";

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  i: any;
  private readonly _configService = inject(AppConfigService);
  ngOnInit(): void {
    console.log(this._configService.config);
    console.log(this.i.a());
  }
}
