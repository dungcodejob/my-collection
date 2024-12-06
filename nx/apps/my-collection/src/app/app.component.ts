import { Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppConfigService } from "@nx/web-shared-app-config";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";

@Component({
  standalone: true,
  imports: [RouterModule, HlmInputDirective],
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  private readonly _configService = inject(AppConfigService);

  ngOnInit(): void {
    console.log(this._configService.config);
  }
}
