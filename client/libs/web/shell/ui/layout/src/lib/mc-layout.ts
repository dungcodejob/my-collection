import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AppSidebarComponent } from "@client/web-shell-ui-sidebar";
import { SiteHeaderComponent } from "@client/web-shell-ui-top-bar";
import { BrnSeparatorComponent } from "@spartan-ng/brain/separator";
import { HlmSeparatorDirective } from "@spartan-ng/helm/separator";

@Component({
  selector: "mc-layout",
  imports: [
    AppSidebarComponent,
    SiteHeaderComponent,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    RouterOutlet,
  ],
  templateUrl: "./mc-layout.html",
  styleUrl: "./mc-layout.css",
})
export class MCLayout {}
