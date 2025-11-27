import { CommonModule, DatePipe, NgOptimizedImage } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { NgIcon } from "@ng-icons/core";
import { HlmButtonImports } from "@spartan-ng/helm/button";

/**
 * Bookmark type for duplicate confirmation
 */
export type DuplicateBookmark = {
  id: string;
  title: string;
  imageUrl?: string;
  createAt: Date | string;
};

/**
 * Confirmation dialog shown when user tries to save a duplicate bookmark
 */
@Component({
  selector: "mc-duplicate-bookmark-confirmation",
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, DatePipe, NgIcon, HlmButtonImports],
  templateUrl: "./duplicate-bookmark-confirmation.component.html",
  styleUrl: "./duplicate-bookmark-confirmation.component.css",
})
export class DuplicateBookmarkConfirmation {
  // Inputs
  readonly duplicateBookmark = input<DuplicateBookmark | null>(null);
  readonly showConfirmation = input<boolean>(false);

  // Outputs
  readonly saveAnyway = output<void>();
  readonly viewExisting = output<void>();
  readonly dismiss = output<void>();

  /**
   * Handle save anyway action
   */
  onSaveAnyway(): void {
    this.saveAnyway.emit();
  }

  /**
   * Handle view existing bookmark action
   */
  onViewExisting(): void {
    this.viewExisting.emit();
  }

  /**
   * Handle dismiss/cancel action
   */
  onDismiss(): void {
    this.dismiss.emit();
  }
}
