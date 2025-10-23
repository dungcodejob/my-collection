import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonModule } from "@spartan-ng/helm/button";
import { HlmInputModule } from "@spartan-ng/helm/input";
import { HlmH2Directive } from "@spartan-ng/helm/typography";
import { BookmarkListFacade } from "./bookmark-list.facade";
@Component({
  selector: "mc-bookmark-list",
  imports: [
    CommonModule,
    HlmButtonModule,
    HlmInputModule,
    NgIconComponent,
    HlmH2Directive,
  ],
  providers: [BookmarkListFacade, provideIcons({ lucidePlus })],
  templateUrl: "./bookmark-list.html",
  styleUrl: "./bookmark-list.css",
})
export class MCBookmarkList {
  private readonly _facade = inject(BookmarkListFacade);

  onCreate(): void {
    console.log("Create bookmark");
  }
}
