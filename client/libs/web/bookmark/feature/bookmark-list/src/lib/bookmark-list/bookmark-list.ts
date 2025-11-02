import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MCBookmarkDetailDialog } from "@client/web-bookmark-detail-dialog";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmTypographyImports } from "@spartan-ng/helm/typography";
import { BookmarkListFacade } from "./bookmark-list.facade";
@Component({
  selector: "mc-bookmark-list",
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmInputImports,
    NgIconComponent,
    HlmTypographyImports,

    MCBookmarkDetailDialog,
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
