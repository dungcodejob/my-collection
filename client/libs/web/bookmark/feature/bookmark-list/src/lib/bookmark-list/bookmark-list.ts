import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { AddBookmarkDialog } from "@client/web-bookmark-add-dialog";
import { MCBookmarkDetailDialog } from "@client/web-bookmark-detail-dialog";
import { MCToastService } from "@client/web-shared-services";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
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
  private readonly _dialogService = inject(HlmDialogService);
  private readonly _toastService = inject(MCToastService);

  /**
   * T072-T073: Open Add Bookmark dialog
   */
  onCreate(): void {
    const dialogRef = this._dialogService.open(AddBookmarkDialog, {
      context: {
        collection: this._facade.$selectCollection(),
      },
      closeOnBackdropClick: false,
      closeOnOutsidePointerEvents: false,
    });

    // T074-T075: Handle dialog result - show notification and refresh list
    dialogRef.closed$.subscribe(result => {
      if (result === true) {
        // Bookmark was created successfully
        this._toastService.success("Bookmark created successfully");
        this._facade.refreshBookmarks();
      }
    });
  }
}
