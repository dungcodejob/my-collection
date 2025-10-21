import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { HlmButtonModule } from "@spartan-ng/helm/button";
import { HlmInputModule } from "@spartan-ng/helm/input";
@Component({
  selector: "mc-bookmark-list",
  imports: [CommonModule, HlmButtonModule, HlmInputModule],
  templateUrl: "./bookmark-list.html",
  styleUrl: "./bookmark-list.css",
})
export class MCBookmarkList {}
