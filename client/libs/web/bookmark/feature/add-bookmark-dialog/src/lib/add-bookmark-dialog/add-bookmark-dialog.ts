/**
 * T053-T070: AddBookmarkDialogComponent
 * Dialog for adding a new bookmark with metadata fetching
 */
import { CommonModule } from "@angular/common";
import { Component, OnInit, effect, inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { injectAutoEffect } from "@client/web-shared-utils";
import { BrnDialogRef } from "@spartan-ng/brain/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { AddBookmarkDialogFacade } from "./add-bookmark-dialog.facade";

@Component({
  selector: "lib-add-bookmark-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmSpinnerImports,
  ],
  providers: [AddBookmarkDialogFacade],
  templateUrl: "./add-bookmark-dialog.html",
  styleUrl: "./add-bookmark-dialog.css",
})
export class AddBookmarkDialog implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  private readonly _autoEffect = injectAutoEffect();
  private readonly _fb = inject(FormBuilder);

  // T048-T052: Inject the store
  readonly store = inject(AddBookmarkDialogFacade);

  // T057-T058: Reactive form
  bookmarkForm!: FormGroup;

  // T061: URL validation state
  urlError = "";

  constructor() {
    // T063: Auto-populate form when metadata is fetched
    effect(() => {
      const metadata = this.store.metadata();
      if (metadata) {
        this.bookmarkForm.patchValue({
          title: metadata.title || "",
          description: metadata.description || "",
        });
      }
    });
  }

  ngOnInit(): void {
    // T057-T058: Initialize form with validation
    this.bookmarkForm = this._fb.group({
      url: ["", [Validators.required, this.urlValidator.bind(this)]],
      title: ["", [Validators.required, Validators.maxLength(200)]],
      description: ["", [Validators.maxLength(1000)]],
      notes: ["", [Validators.maxLength(2000)]],
    });

    this.closeDialogEffect();
  }

  /**
   * T061: URL validation logic
   */
  private urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  /**
   * T062: Fetch metadata on button click
   */
  onFetchMetadata(): void {
    const url = this.bookmarkForm.get("url")?.value;

    if (!url) {
      this.urlError = "Please enter a URL";
      return;
    }

    if (!this.store.isValidUrl()) {
      this.urlError = "Please enter a valid URL";
      return;
    }

    this.urlError = "";
    this.store.fetchMetadata(url);
  }

  /**
   * T064: Save bookmark logic
   */
  onSave(): void {
    if (!this.bookmarkForm.valid) {
      this.bookmarkForm.markAllAsTouched();
      return;
    }

    // Update store with form values
    const formValue = this.bookmarkForm.value;
    this.store.updateUrl(formValue.url);
    this.store.updateTitle(formValue.title);
    this.store.updateDescription(formValue.description);
    this.store.updateNotes(formValue.notes);

    // Save bookmark
    this.store.saveBookmark();
  }

  /**
   * T065: Dialog close logic
   */
  onCancel(): void {
    if (this.store.hasChanges()) {
      // TODO: Show confirmation dialog if there are unsaved changes
      // For now, just close
    }
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

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = "assets/images/placeholder.png";
    }
  }

  /**
   * Get form control for template
   */
  getControl(name: string): AbstractControl | null {
    return this.bookmarkForm.get(name);
  }

  private closeDialogEffect(): void {
    this._autoEffect(() => {
      if (this.store.$isSaveBookmarkFulfilled()) {
        this._dialogRef.close(true);
      }
    });
  }
}
