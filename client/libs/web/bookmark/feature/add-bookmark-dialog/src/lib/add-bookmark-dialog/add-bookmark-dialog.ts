/**
 * T053-T070: AddBookmarkDialogComponent
 * Dialog for adding a new bookmark with metadata fetching
 */
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BookmarkCreateDto } from "@client/web-bookmark-data-access";
import { ImageGallery } from "@client/web-bookmark-ui-image-gallery";
import { Collection } from "@client/web-collection-data-access";
import { MCConfirmDialogModule } from "@client/web-shared-ui-dialog";
import { injectAutoEffect, simpleUrlValidator } from "@client/web-shared-utils";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertCircle } from "@ng-icons/lucide";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { AddBookmarkDialogFacade } from "./add-bookmark-dialog.facade";

type BookmarkForm = FormGroup<{
  url: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  faviconUrl: FormControl<string | null>;
  imageUrl: FormControl<string | null>;
  siteName: FormControl<string | null>;
  notes: FormControl<string | null>;
  tags: FormControl<string[]>;
}>;

@Component({
  selector: "mc-add-bookmark-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmSpinnerImports,
    ImageGallery,
    NgOptimizedImage,
    MCConfirmDialogModule,
    NgIcon,
  ],
  providers: [AddBookmarkDialogFacade, provideIcons({ lucideAlertCircle })],
  templateUrl: "./add-bookmark-dialog.html",
  styleUrl: "./add-bookmark-dialog.css",
})
export class AddBookmarkDialog implements OnInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{
    collection: Collection | null;
  }>();

  private readonly _autoEffect = injectAutoEffect();
  private readonly _fb = inject(NonNullableFormBuilder);

  // T048-T052: Inject the store
  readonly store = inject(AddBookmarkDialogFacade);

  // T057-T058: Reactive form
  bookmarkForm!: BookmarkForm;

  // T061: URL validation state
  urlError = "";

  ngOnInit(): void {
    console.log("collection", this._dialogContext.collection);
    // T057-T058: Initialize form with validation
    this._initForm();
    this._setValueForControls();
    this.closeDialogEffect();
    this.setMetadataToFormEffect();
    this.duplicateCheckEffect();
  }

  /**
   * T062: Fetch metadata on button click
   * T095: Add confirmation prompt if user re-fetches metadata with unsaved edits
   */

  isUnsavedChanges = (): boolean => {
    return this.bookmarkForm.dirty && !!this.store.metadata();
  };

  onFetchMetadata(): void {
    const url = this.bookmarkForm.get("url")?.value;

    if (!url) {
      this.urlError = "Please enter a URL";
      return;
    }

    this.urlError = "";
    this.store.fetchMetadata(url);
  }

  /**
   * T064, T141: Save bookmark logic with duplicate check
   */
  onSave(): void {
    if (!this.bookmarkForm.valid) {
      this.bookmarkForm.markAllAsTouched();
      return;
    }

    if (!this.store.isDuplicate()) {
      const { url } = this.bookmarkForm.value as Required<BookmarkForm["value"]>;
      this.store.checkDuplicate(url);
    } else {
      this.saveBookmark();
    }
  }

  /**
   * T065: Dialog close logic
   */
  onCancel(): void {
    this._dialogRef.close(false);
  }

  /**
   * T069: Handle Enter key to save
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      this.onSave();
    }
  }

  /**
   * Select an image from available images
   */
  onSelectImage(index: number): void {
    this.store.selectImage(index);
  }

  /**
   * Handle image loading errors
   * Supports both Event (from img tag) and ImageGallery error format
   */
  onImageError(event: Event | { index: number; url: string }): void {
    if (event instanceof Event) {
      // Handle direct img tag error
      const target = event.target as HTMLImageElement;
      if (target) {
        target.src = "assets/images/placeholder.png";
      }
    } else {
      // Handle ImageGallery component error
      console.error(`Image ${event.index} failed to load:`, event.url);
      // The ImageGallery component handles the fallback internally
    }
  }

  /**
   * Get form control for template
   */
  getControl(name: string): AbstractControl | null {
    return this.bookmarkForm.get(name);
  }

  /**
   * T122: Handle file selection from file input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.store.handleFileSelection(file);
    }

    // Reset input value to allow selecting the same file again
    input.value = "";
  }

  /**
   * T126: Handle image URL input
   */
  onImageUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const url = input.value.trim();
    this.store.setCustomImageUrl(url);
  }

  /**
   * T126: Validate image URL on blur
   */
  onImageUrlBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const url = input.value.trim();
    if (url) {
      this.store.validateImageUrl(url);
    }
  }

  /**
   * T128: Revert to default fetched image
   */
  onRevertToDefault(): void {
    this.store.revertToDefaultImage();
  }

  /**
   * T146: Handle "Save Anyway" action from duplicate confirmation
   */
  onSaveAnyway(): void {
    this.store.saveAnyway();
    this.saveBookmark();
  }

  /**
   * T146: Handle "View Existing" action from duplicate confirmation
   * T145: Navigate to existing bookmark detail
   */
  onViewExisting(): void {
    const bookmarkId = this.store.duplicateBookmark()?.id;
    if (bookmarkId) {
      // TODO: Navigate to bookmark detail page
      console.log("Navigate to bookmark:", bookmarkId);
      // For now, just close the dialog
      this._dialogRef.close(false);
    }
  }

  /**
   * Dismiss duplicate confirmation dialog
   */
  onDismissDuplicateConfirmation(): void {
    this.store.dismissDuplicateConfirmation();
  }

  private _initForm(): void {
    this.bookmarkForm = this._fb.group<BookmarkForm["controls"]>({
      url: this._fb.control("", [Validators.required, simpleUrlValidator()]),
      title: this._fb.control("", [Validators.required, Validators.maxLength(200)]),
      description: this._fb.control("", [Validators.maxLength(1000)]),
      notes: this._fb.control("", [Validators.maxLength(2000)]),
      imageUrl: this._fb.control("", [Validators.required]),
      faviconUrl: this._fb.control("", [Validators.required]),
      siteName: this._fb.control("", [Validators.required]),
      tags: this._fb.control<string[]>([]),
    });
  }

  private _setValueForControls(): void {
    this.bookmarkForm.patchValue({});
  }

  private closeDialogEffect(): void {
    this._autoEffect(() => {
      if (this.store.$isSaveBookmarkFulfilled()) {
        this._dialogRef.close(true);
      }
    });
  }

  private setMetadataToFormEffect(): void {
    // T063: Auto-populate form when metadata is fetched
    this._autoEffect(() => {
      const metadata = this.store.metadata();
      const isFetchMetadataFulfilled = this.store.$isFetchMetadataFulfilled();
      if (isFetchMetadataFulfilled && metadata) {
        this.bookmarkForm.patchValue({
          title: metadata.title || "",
          description: metadata.description || "",
          imageUrl: metadata.image || "",
          faviconUrl: metadata.favicon || "",
          siteName: metadata.siteName || "",
        });
      }
    });
  }

  /**
   * T141: Auto-save when duplicate check completes with no duplicate found
   */
  private duplicateCheckEffect(): void {
    this._autoEffect(() => {
      const isCheckDuplicateFulfilled = this.store.$isCheckDuplicateFulfilled();
      const isDuplicate = this.store.isDuplicate();
      const showConfirmation = this.store.showDuplicateConfirmation();

      // If duplicate check completed and no duplicate found, proceed with save
      if (isCheckDuplicateFulfilled && !isDuplicate && !showConfirmation) {
        console.log("duplicateCheckEffect Save bookmark");

        const { url, title, description, imageUrl, faviconUrl, siteName, tags } = this
          .bookmarkForm.value as Required<BookmarkForm["value"]>;

        const request: BookmarkCreateDto = {
          url: url,
          title: title,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          faviconUrl: faviconUrl || undefined,
          siteName: siteName || undefined,
          tags: tags.length > 0 ? tags : [],
        };

        this.store.saveBookmark(request);
      }
    });
  }

  private saveBookmark(): void {
    const { url, title, description, imageUrl, faviconUrl, siteName, tags, notes } = this
      .bookmarkForm.value as Required<BookmarkForm["value"]>;

    const { collection } = this._dialogContext;

    const request: BookmarkCreateDto = {
      url: url,
      title: title,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      faviconUrl: faviconUrl || undefined,
      siteName: siteName || undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : [],
      collectionId: collection?.id || undefined,
    };
    this.store.saveBookmark(request);
  }
}
