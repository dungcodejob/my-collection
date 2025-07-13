import { Component } from "@angular/core";
import { AppSidebarComponent, MCSidebar } from "@client/web-shell-ui-sidebar";

@Component({
  selector: "mc-layout",
  imports: [MCSidebar, AppSidebarComponent],
  templateUrl: "./mc-layout.html",
  styleUrl: "./mc-layout.css",
})
export class MCLayout {}
