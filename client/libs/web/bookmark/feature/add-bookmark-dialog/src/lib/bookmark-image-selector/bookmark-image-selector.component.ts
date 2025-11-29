import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import { MCDialogService } from "@client/web-shared-ui-dialog";
import { ObjectValues } from "@client/web-shared-utils";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideImage, lucideLink, lucideUpload } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { HlmTabsImports } from "@spartan-ng/helm/tabs";
import { ImageGalleryDialog } from "../image-gallery-dialog/image-gallery-dialog.component";

const IMAGE_SELECTOR_CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

type ImageGalleryError = { index: number; url: string };

const imageSelectorTab = {
  GALLERY: "gallery",
  UPLOAD: "upload",
  URL: "url",
} as const;

const imageSelectorTabLabels: Record<ImageSelectorTab, string> = {
  [imageSelectorTab.GALLERY]: "Gallery",
  [imageSelectorTab.UPLOAD]: "Upload",
  [imageSelectorTab.URL]: "URL",
};

const imageSelectorTabIcons: Record<ImageSelectorTab, string> = {
  [imageSelectorTab.GALLERY]: "lucideImage",
  [imageSelectorTab.UPLOAD]: "lucideUpload",
  [imageSelectorTab.URL]: "lucideLink",
};

type ImageSelectorTab = ObjectValues<typeof imageSelectorTab>;

/**
 * Component for selecting and managing bookmark images
 * Handles image gallery, custom uploads, and URL inputs with tabs
 */
@Component({
  selector: "mc-bookmark-image-selector",
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSpinnerImports,
    HlmIconImports,
    HlmTabsImports,
    NgIconComponent,
  ],
  providers: [provideIcons({ lucideImage, lucideUpload, lucideLink })],
  templateUrl: "./bookmark-image-selector.component.html",
  styleUrl: "./bookmark-image-selector.component.css",
})
export class BookmarkImageSelector {
  private readonly _dialogService = inject(MCDialogService);

  // Configuration
  readonly config = IMAGE_SELECTOR_CONFIG;

  // Local state
  readonly activeTab = signal<ImageSelectorTab>("gallery");
  readonly imageSelectorTab = imageSelectorTab;
  readonly tabOptions = Object.values(imageSelectorTab).map(tab => ({
    value: tab,
    label: imageSelectorTabLabels[tab],
    icon: imageSelectorTabIcons[tab],
  }));

  // Inputs - Data from parent (using modern input signals)
  readonly availableImages = input<string[]>([]);
  readonly selectedImage = input<string | null>(null);
  readonly selectedImageIndex = input<number>(0);
  readonly customImageUrl = input<string>("");
  readonly hasCustomImage = input<boolean>(false);
  readonly uploadProgress = input<number>(0);
  readonly isUploadPending = input<boolean>(false);
  readonly isValidateUrlPending = input<boolean>(false);
  readonly imageError = input<string | null>(null);
  readonly selectedTitle = input<string>("Bookmark thumbnail");

  // Outputs - Events to parent
  readonly imageSelected = output<number>();
  readonly fileSelected = output<Event>();
  readonly imageUrlChanged = output<string>();
  readonly imageUrlBlurred = output<string>();
  readonly revertToDefault = output<void>();
  readonly imageLoadError = output<Event | ImageGalleryError>();

  /**
   * Open gallery dialog for image selection
   */
  openGalleryDialog(): void {
    const dialogRef = this._dialogService.open(ImageGalleryDialog, {
      context: {
        images: this.availableImages(),
        selectedIndex: this.selectedImageIndex(),
      },
    });

    dialogRef.closed$.subscribe(result => {
      if (result !== null && result !== undefined) {
        this.imageSelected.emit(result as number);
      }
    });
  }

  /**
   * Handle image selection from gallery
   */
  onSelectImage(index: number): void {
    this.imageSelected.emit(index);
  }

  /**
   * Handle file selection from input
   */
  onFileSelected(fileEvent: Event): void {
    this.fileSelected.emit(fileEvent);
  }

  /**
   * Handle image URL input changes
   */
  onImageUrlInput(inputEvent: Event): void {
    const inputEl = inputEvent.target as HTMLInputElement;
    const url = inputEl.value.trim();
    this.imageUrlChanged.emit(url);
  }

  /**
   * Handle image URL blur (validation trigger)
   */
  onImageUrlBlur(blurEvent: Event): void {
    const inputEl = blurEvent.target as HTMLInputElement;
    const url = inputEl.value.trim();
    this.imageUrlBlurred.emit(url);
  }

  /**
   * Handle revert to default image
   */
  onRevertToDefault(): void {
    this.revertToDefault.emit();
  }

  /**
   * Handle image loading errors from both direct img tags and ImageGallery
   */
  onImageError(event: Event | ImageGalleryError): void {
    this.imageLoadError.emit(event);
  }
}
