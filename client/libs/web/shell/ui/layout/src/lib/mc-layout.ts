import { Component } from "@angular/core";
import { AppSidebarComponent } from "@client/web-shell-ui-sidebar";

@Component({
  selector: "mc-layout",
  imports: [AppSidebarComponent, AppSidebarComponent],
  templateUrl: "./mc-layout.html",
  styleUrl: "./mc-layout.css",
})
export class MCLayout {}
