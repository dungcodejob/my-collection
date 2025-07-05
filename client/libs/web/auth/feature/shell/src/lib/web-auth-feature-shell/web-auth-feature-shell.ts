import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthHeaderComponent } from '../auth-header/auth-header.component';

@Component({
  selector: "lib-web-auth-feature-shell",
  imports: [CommonModule, AuthHeaderComponent],
  templateUrl: "./web-auth-feature-shell.html",
  styleUrl: "./web-auth-feature-shell.css",
})
export class WebAuthFeatureShell {}
