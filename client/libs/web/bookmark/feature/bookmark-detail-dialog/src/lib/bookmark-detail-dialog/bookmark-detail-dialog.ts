import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { BookmarkApi, BookmarkCreateDto } from "@client/web-bookmark-data-access";
import { Collection } from "@client/web-collection-data-access";
import { HttpService, SingleResponseDto } from "@client/web-core-http";
import { NgIconComponent } from "@ng-icons/core";
import { BrnDialogImports } from "@spartan-ng/brain/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmFormFieldImports } from "@spartan-ng/helm/form-field";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmTextareaImports } from "@spartan-ng/helm/textarea";
import { catchError, finalize, of } from "rxjs";

type UrlMetadata = {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
};

@Component({
  selector: "mc-bookmark-detail-dialog",
  templateUrl: "./bookmark-detail-dialog.html",
  styleUrl: "./bookmark-detail-dialog.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    BrnDialogImports,
    HlmDialogImports,
    HlmButtonImports,
    HlmFormFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIconComponent,
  ],
})
export class MCBookmarkDetailDialog {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _bookmarkApi = inject(BookmarkApi);
  private readonly _httpService = inject(HttpService);

  // Inputs
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly $isOpen = input<boolean>(true, { alias: "isOpen" });
  readonly $collections = input<Collection[]>([]);

  // Outputs
  readonly saved = output<void>();
  readonly closed = output<void>();

  // Private signals
  private readonly _$isMetadataLoading = signal(false);
  private readonly _$isSaving = signal(false);
  private readonly _$urlError = signal<string | null>(null);
  private readonly _$metadata = signal<UrlMetadata | null>(null);

  // Public signals
  readonly $title = signal("Add Bookmark");
  readonly $isMetadataLoading = this._$isMetadataLoading.asReadonly();
  readonly $isSaving = this._$isSaving.asReadonly();
  readonly $urlError = this._$urlError.asReadonly();
  readonly $metadata = this._$metadata.asReadonly();

  // Form
  readonly form: FormGroup = this._formBuilder.group({
    url: ["", [Validators.required, this._urlValidator]],
    title: ["", Validators.required],
    description: [""],
    notes: [""],
    collectionId: [""],
  });

  // Computed properties
  readonly $isSaveButtonDisabled = computed(
    () => this.form.invalid || this._$isSaving() || this._$isMetadataLoading()
  );

  readonly $isGenMetadataDisabled = computed(() => {
    const urlControl = this.form.get("url");
    return !urlControl?.value || urlControl.invalid || this._$isMetadataLoading();
  });

  constructor() {
    // Reset form when dialog opens
    effect(() => {
      if (this.$isOpen()) {
        this._resetForm();
      }
    });

    // Update form when metadata is fetched
    effect(() => {
      const metadata = this._$metadata();
      if (metadata) {
        this.form.patchValue({
          title: metadata.title || "",
          description: metadata.description || "",
        });
      }
    });
  }

  onGenMetadata(): void {
    const url = this.form.get("url")?.value;
    if (!url || this._$isMetadataLoading()) {
      return;
    }

    this._$urlError.set(null);
    this._$isMetadataLoading.set(true);

    // Call metadata API endpoint
    this._httpService
      .get<SingleResponseDto<UrlMetadata>>(`/metadata?url=${encodeURIComponent(url)}`)
      .pipe(
        catchError(error => {
          console.error("Failed to fetch metadata:", error);
          this._$urlError.set(
            "Failed to fetch metadata. Please check the URL and try again."
          );
          return of(null);
        }),
        finalize(() => {
          this._$isMetadataLoading.set(false);
        })
      )
      .subscribe(response => {
        if (response?.result?.data) {
          this._$metadata.set(response?.result.data);
        }
      });
  }

  onSave(): void {
    if (this.form.invalid || this._$isSaving()) {
      return;
    }

    this._$isSaving.set(true);
    this._$urlError.set(null);

    const formValue = this.form.value;
    const metadata = this._$metadata();

    const bookmarkData: BookmarkCreateDto = {
      url: formValue.url,
      title: formValue.title,
      description: formValue.description || undefined,
      notes: formValue.notes || undefined,
      collectionId: formValue.collectionId || undefined,
      imageUrl: metadata?.imageUrl || undefined,
      siteName: metadata?.siteName || undefined,
    };

    this._bookmarkApi
      .createBookmark(bookmarkData)
      .pipe(
        catchError(error => {
          console.error("Failed to save bookmark:", error);
          this._$urlError.set("Failed to save bookmark. Please try again.");
          return of(null);
        }),
        finalize(() => {
          this._$isSaving.set(false);
        })
      )
      .subscribe(response => {
        if (response) {
          this.saved.emit();
          this.closed.emit();
        }
      });
  }

  onClose(): void {
    this.closed.emit();
  }

  private _resetForm(): void {
    this.form.reset();
    this._$metadata.set(null);
    this._$urlError.set(null);
    this._$isMetadataLoading.set(false);
    this._$isSaving.set(false);
  }

  private _urlValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }
}
