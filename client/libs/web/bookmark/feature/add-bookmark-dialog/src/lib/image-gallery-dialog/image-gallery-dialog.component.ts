import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ImageGallery, ImageGalleryError } from "@client/web-bookmark-ui-image-gallery";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";

/**
 * Dialog for selecting an image from available gallery images
 */
@Component({
  selector: "mc-image-gallery-dialog",
  standalone: true,
  imports: [CommonModule, HlmButtonImports, HlmDialogImports, ImageGallery],
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Choose Image</h3>
      <p hlmDialogDescription>
        Select an image from {{ images().length }} available options
      </p>
    </hlm-dialog-header>

    <div class="max-h-[60vh] overflow-y-auto py-4">
      <mc-image-gallery
        [columns]="5"
        [images]="images()"
        [selectedIndex]="selectedIndex()"
        (imageError)="onImageError($event)"
        (imageSelected)="onImageSelected($event)"
      />
    </div>

    <hlm-dialog-footer>
      <button hlmBtn type="button" variant="outline" (click)="onCancel()">Cancel</button>
    </hlm-dialog-footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ImageGalleryDialog {
  private readonly _dialogRef = inject<BrnDialogRef<number | null>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{
    images: string[];
    selectedIndex: number;
  }>();

  // Inputs from context
  readonly images = signal(this._dialogContext.images || []);
  readonly selectedIndex = signal(this._dialogContext.selectedIndex || 0);

  /**
   * Handle image selection
   */
  onImageSelected(index: number): void {
    this._dialogRef.close(index);
  }

  /**
   * Handle image error
   */
  onImageError(event: Event | ImageGalleryError): void {
    console.error("Image failed to load:", event);
  }

  /**
   * Handle cancel
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
