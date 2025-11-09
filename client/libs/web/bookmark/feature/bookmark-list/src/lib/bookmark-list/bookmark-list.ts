import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { AddBookmarkDialog } from "@client/web-bookmark-add-dialog";
import { FilterType } from "@client/web-bookmark-data-access";
import { MCToastService } from "@client/web-shared-services";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmPaginationImports } from "@spartan-ng/helm/pagination";
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
    NgOptimizedImage,
    HlmCardImports,
    HlmPaginationImports,
  ],
  providers: [BookmarkListFacade, provideIcons({ lucidePlus })],
  templateUrl: "./bookmark-list.html",
  styleUrl: "./bookmark-list.css",
})
export class MCBookmarkList {
  protected readonly facade = inject(BookmarkListFacade);
  private readonly _dialogService = inject(HlmDialogService);
  private readonly _toastService = inject(MCToastService);

  // US1 T048: Expose Math for template
  protected readonly Math = Math;

  /**
   * US1 T043: Handle search input
   */
  onSearch(query: string): void {
    this.facade.removeFilter("title");
    if (query.trim()) {
      this.facade.addFilter({
        field: "title",
        type: FilterType.Keyword,
        value: query,
      });
    }
  }

  /**
   * US1 T043: Toggle favorite filter
   */
  onToggleFavoriteFilter(): void {
    // Toggle favorite filter on/off
    this.facade.removeFilter("isFavorite");
    // Could extend to add filter if needed
  }

  /**
   * US1 T046: Handle page change
   */
  onPageChange(page: number): void {
    this.facade.setPage(page);
  }

  /**
   * US1 T046: Go to next page
   */
  onNextPage(): void {
    this.facade.nextPage();
  }

  /**
   * US1 T046: Go to previous page
   */
  onPreviousPage(): void {
    this.facade.previousPage();
  }

  onClearSelection(): void {
    this.facade.onClearSelection();
  }

  onSelectAll(): void {
    this.facade.onSelectAll();
  }

  /**
   * US2 T055: Handle display mode change
   */
  onDisplayModeChange(mode: "list" | "card" | "moodboard"): void {
    this.facade.setDisplayMode(mode);
  }

  /**
   * T072-T073: Open Add Bookmark dialog
   */
  onCreate(): void {
    const dialogRef = this._dialogService.open(AddBookmarkDialog, {
      context: {
        collection: this.facade.$selectCollection(),
      },
      closeOnBackdropClick: false,
      closeOnOutsidePointerEvents: false,
    });

    // T074-T075: Handle dialog result - show notification and refresh list
    dialogRef.closed$.subscribe(result => {
      if (result === true) {
        // Bookmark was created successfully
        this._toastService.success("Bookmark created successfully");
        this.facade.refreshBookmarks();
      }
    });
  }
}
