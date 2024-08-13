import { Component } from "@angular/core";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmCardDirective } from "@spartan-ng/ui-card-helm";
import { HlmSkeletonComponent } from "@spartan-ng/ui-skeleton-helm";
import { HlmMutedDirective, HlmSmallDirective } from "@spartan-ng/ui-typography-helm";

@Component({
  selector: "app-bookmark-skeleton",
  standalone: true,
  imports: [
    HlmCardDirective,
    HlmButtonDirective,
    HlmSmallDirective,
    HlmMutedDirective,
    HlmSkeletonComponent,
  ],
  templateUrl: "./bookmark-skeleton.component.html",
  styleUrl: "./bookmark-skeleton.component.scss",
})
export class BookmarkSkeletonComponent {}
