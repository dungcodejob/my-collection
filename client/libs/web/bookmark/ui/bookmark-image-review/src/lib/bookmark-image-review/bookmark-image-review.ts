import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideCheck,
  lucideGlobe,
  lucideImage,
  lucideImageOff,
  lucideImages,
  lucideLoader,
  lucideUpload,
  lucideX,
  lucideZoomIn,
} from "@ng-icons/lucide";
import { BrnDialogImports } from "@spartan-ng/brain/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmScrollAreaImports } from "@spartan-ng/helm/scroll-area";
import { NgScrollbarModule } from "ngx-scrollbar";
// Types and Interfaces
type ImageSource = {
  readonly id: string;
  readonly url: string;
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
  readonly size?: number; // file size in bytes
  readonly type: "metadata" | "uploaded";
};

type BookmarkMetadata = {
  readonly title?: string;
  readonly description?: string;
  readonly siteName?: string;
  readonly images?: readonly string[];
  readonly favicon?: string;
};

type ImageValidationError = {
  readonly type: "size" | "format" | "dimensions" | "network";
  readonly message: string;
};

type ImageUploadConfig = {
  readonly maxSizeBytes: number;
  readonly allowedFormats: readonly string[];
  readonly maxDimensions?: { width: number; height: number };
};

/**
 * MCBookmarkImageReview - Dumb Component
 *
 * A comprehensive image review component for bookmark management that provides:
 * - Image preview with responsive design and zoom functionality
 * - Display of available images from website metadata
 * - Image selection with immediate preview updates
 * - Local image upload with validation and preview
 * - Error handling for various scenarios
 * - Performance optimization for multiple images
 *
 * @example
 * ```html
 * <mc-bookmark-image-review
 *   [currentImageUrl]="bookmark.imageUrl"
 *   [metadata]="bookmark.metadata"
 *   [isEnabled]="!isLoading"
 *   [uploadConfig]="imageUploadConfig"
 *   (imageSelected)="onImageSelected($event)"
 *   (imageUploaded)="onImageUploaded($event)"
 *   (validationError)="onValidationError($event)">
 * </mc-bookmark-image-review>
 * ```
 */
@Component({
  selector: "mc-bookmark-image-review",
  imports: [
    NgIconComponent,
    HlmButtonImports,
    HlmInputImports,
    HlmScrollAreaImports,
    BrnDialogImports,
    HlmDialogImports,
    NgScrollbarModule,
  ],
  providers: [
    provideIcons({
      lucideZoomIn,
      lucideLoader,
      lucideImageOff,
      lucideImage,
      lucideUpload,
      lucideCheck,
      lucideGlobe,
      lucideImages,
      lucideX,
    }),
  ],
  templateUrl: "./bookmark-image-review.html",
  styleUrl: "./bookmark-image-review.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCBookmarkImageReview {
  // ViewChild references
  private readonly _fileInput = viewChild<ElementRef<HTMLInputElement>>("fileInput");

  // Input signals
  readonly $currentImageUrl = input<string>("", { alias: "currentImageUrl" });
  readonly $metadata = input<BookmarkMetadata>({}, { alias: "metadata" });
  readonly $isEnabled = input(true, { alias: "isEnabled" });
  readonly $uploadConfig = input<ImageUploadConfig>(
    {
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedFormats: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      maxDimensions: { width: 2048, height: 2048 },
    },
    { alias: "uploadConfig" }
  );

  // Output signals
  readonly imageSelected = output<string>();
  readonly imageUploaded = output<{ file: File; dataUrl: string }>();
  readonly validationError = output<ImageValidationError>();

  // Private state signals
  private readonly _$selectedImageId = signal<string | null>(null);
  private readonly _$uploadedImages = signal<readonly ImageSource[]>([]);
  readonly _$isImageZoomed = signal(false);
  private readonly _$zoomedImageUrl = signal<string | null>(null);
  private readonly _$isUploading = signal(false);
  private readonly _$loadingImages = signal<Set<string>>(new Set());
  private readonly _$errorImages = signal<Set<string>>(new Set());

  // Computed signals
  readonly $metadataImages = computed<readonly ImageSource[]>(() => {
    const metadata = this.$metadata();
    const images = metadata.images || [];

    return images.map((url, index) => ({
      id: `metadata-${index}`,
      url,
      alt: metadata.title || `Image ${index + 1}`,
      type: "metadata" as const,
    }));
  });

  readonly $allImages = computed<readonly ImageSource[]>(() => [
    ...this.$metadataImages(),
    ...this._$uploadedImages(),
  ]);

  readonly $hasImages = computed<boolean>(() => this.$allImages().length > 0);

  readonly $selectedImageUrl = computed<string>(() => {
    const selectedId = this._$selectedImageId();
    if (!selectedId) {
      return this.$currentImageUrl();
    }

    const selectedImage = this.$allImages().find(img => img.id === selectedId);
    return selectedImage?.url || this.$currentImageUrl();
  });

  readonly $isImageLoading = computed<boolean>(() => {
    const url = this.$selectedImageUrl();
    return this._$loadingImages().has(url);
  });

  readonly $hasImageError = computed<boolean>(() => {
    const url = this.$selectedImageUrl();
    return this._$errorImages().has(url);
  });

  readonly $isUploading = computed<boolean>(() => this._$isUploading());
  readonly $isDragging = signal(false);
  // Public methods for template

  /**
   * Handles image selection
   */
  onImageSelect(image: ImageSource): void {
    if (!this.$isEnabled()) return;

    this._$selectedImageId.set(image.id);
    this.imageSelected.emit(image.url);
  }

  /**
   * Handles image zoom functionality
   */
  onImageZoom(imageUrl: string): void {
    if (!this.$isEnabled() || !imageUrl) return;

    this._$zoomedImageUrl.set(imageUrl);
    this._$isImageZoomed.set(true);
  }

  /**
   * Closes the zoom modal
   */
  onCloseZoom(): void {
    this._$isImageZoomed.set(false);
    this._$zoomedImageUrl.set(null);
  }

  /**
   * Handles upload button click
   */
  onUploadClick(): void {
    if (!this.$isEnabled() || this._$isUploading()) return;

    const fileInput = this._fileInput();
    if (fileInput) {
      fileInput.nativeElement.click();
    }
  }

  /**
   * Handles file selection from input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const validationError = this._validateFile(file);
    if (validationError) {
      this.validationError.emit(validationError);
      input.value = ""; // Reset input
      return;
    }

    this._processFileUpload(file);
  }

  /**
   * Handles image load events
   */
  onImageLoad(imageUrl: string): void {
    this._$loadingImages.update(set => {
      const newSet = new Set(set);
      newSet.delete(imageUrl);
      return newSet;
    });

    this._$errorImages.update(set => {
      const newSet = new Set(set);
      newSet.delete(imageUrl);
      return newSet;
    });
  }

  /**
   * Handles image error events
   */
  onImageError(imageUrl: string): void {
    this._$loadingImages.update(set => {
      const newSet = new Set(set);
      newSet.delete(imageUrl);
      return newSet;
    });

    this._$errorImages.update(set => {
      const newSet = new Set(set);
      newSet.add(imageUrl);
      return newSet;
    });
  }

  /**
   * Handles image load start events
   */
  onImageLoadStart(imageUrl: string): void {
    this._$loadingImages.update(set => {
      const newSet = new Set(set);
      newSet.add(imageUrl);
      return newSet;
    });
  }

  /**
   * Checks if an image is currently selected
   */
  isImageSelected(image: ImageSource): boolean {
    return this._$selectedImageId() === image.id;
  }

  /**
   * Gets appropriate alt text for an image
   */
  getImageAlt(image: ImageSource): string {
    return image.alt || `${image.type === "metadata" ? "Website" : "Uploaded"} image`;
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Private methods

  /**
   * Validates uploaded file
   */
  private _validateFile(file: File): ImageValidationError | null {
    const config = this.$uploadConfig();

    // Check file format
    if (!config.allowedFormats.includes(file.type)) {
      return {
        type: "format",
        message: `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${config.allowedFormats.join(", ")}`,
      };
    }

    // Check file size
    if (file.size > config.maxSizeBytes) {
      return {
        type: "size",
        message: `File quá lớn. Kích thước tối đa: ${this.formatFileSize(config.maxSizeBytes)}`,
      };
    }

    return null;
  }

  /**
   * Processes file upload
   */
  private _processFileUpload(file: File): void {
    this._$isUploading.set(true);

    const reader = new FileReader();

    reader.onload = (e): void => {
      const dataUrl = e.target?.result as string;

      if (this.$uploadConfig().maxDimensions) {
        this._validateImageDimensions(dataUrl, file);
      } else {
        this._addUploadedImage(file, dataUrl);
      }
    };

    reader.onerror = (): void => {
      this._$isUploading.set(false);
      this.validationError.emit({
        type: "network",
        message: "Không thể đọc file. Vui lòng thử lại.",
      });
    };

    reader.readAsDataURL(file);
  }

  /**
   * Validates image dimensions
   */
  private _validateImageDimensions(dataUrl: string, file: File): void {
    const img = new Image();

    img.onload = (): void => {
      const config = this.$uploadConfig();
      const maxDimensions = config.maxDimensions!;

      if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
        this._$isUploading.set(false);
        this.validationError.emit({
          type: "dimensions",
          message: `Kích thước ảnh quá lớn. Tối đa: ${maxDimensions.width}x${maxDimensions.height}px`,
        });
        return;
      }

      this._addUploadedImage(file, dataUrl);
    };

    img.onerror = (): void => {
      this._$isUploading.set(false);
      this.validationError.emit({
        type: "format",
        message: "File không phải là ảnh hợp lệ.",
      });
    };

    img.src = dataUrl;
  }

  /**
   * Adds uploaded image to the list
   */
  private _addUploadedImage(file: File, dataUrl: string): void {
    const newImage: ImageSource = {
      id: `uploaded-${Date.now()}`,
      url: dataUrl,
      alt: file.name,
      size: file.size,
      type: "uploaded",
    };

    this._$uploadedImages.update(images => [...images, newImage]);
    this._$selectedImageId.set(newImage.id);
    this._$isUploading.set(false);

    this.imageUploaded.emit({ file, dataUrl });
    this.imageSelected.emit(dataUrl);
  }
}
