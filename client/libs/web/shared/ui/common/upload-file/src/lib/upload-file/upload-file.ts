import { CommonModule } from "@angular/common";
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideCheck,
  lucideCircleAlert,
  lucideFile,
  lucideUpload,
  lucideX,
} from "@ng-icons/lucide";

type UploadMetadata = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  extra?: Record<string, unknown>;
};

export type UploadValue = {
  url: string;
  metadata: UploadMetadata;
} | null;

type UploadApiResponse = {
  url: string;
  uploadedAt?: string;
  metadata?: Record<string, unknown>;
};

@Component({
  selector: "mc-upload-file",
  imports: [CommonModule, NgIconComponent, HttpClientModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MCUploadFile,
      multi: true,
    },
    provideIcons({
      lucideUpload,
      lucideFile,
      lucideX,
      lucideCircleAlert,
      lucideCheck,
    }),
  ],
  templateUrl: "./upload-file.html",
  styleUrl: "./upload-file.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCUploadFile implements ControlValueAccessor {
  // Inputs
  readonly $endpoint = input.required<string>({
    alias: "endpoint",
  });

  // State signals
  readonly $isDragging = signal(false);
  readonly $isUploading = signal(false);
  readonly $uploadProgress = signal(0);
  readonly $disabled = signal(false);
  readonly $error = signal<string | null>(null);

  // Value for CVA
  readonly $value = signal<UploadValue>(null);

  // Derived file info for display
  readonly $fileInfo = computed(() => {
    const v = this.$value();
    return v?.metadata ?? null;
  });

  // Http client
  private readonly _http = inject(HttpClient);

  // CVA callbacks
  private _onChange: (value: UploadValue) => void = () => {};
  private _onTouched: () => void = () => {};

  // ControlValueAccessor methods
  writeValue(value: UploadValue): void {
    this.$value.set(value);
    this.$error.set(null);
  }

  registerOnChange(fn: (value: UploadValue) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.$disabled.set(isDisabled);
  }

  // UI handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.$disabled()) {
      return;
    }
    this.$isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.$isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.$isDragging.set(false);
    if (this.$disabled()) {
      return;
    }
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this._onTouched();
      this._upload(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    if (this.$disabled()) {
      return;
    }
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;
    if (file) {
      this._onTouched();
      this._upload(file);
      // Reset input so the same file can be selected again
      inputEl.value = "";
    }
  }

  onBrowseClick(fileInput: HTMLInputElement): void {
    if (this.$disabled()) {
      return;
    }
    fileInput.click();
  }

  clear(): void {
    this.$value.set(null);
    this.$uploadProgress.set(0);
    this.$error.set(null);
    this._onChange(this.$value());
  }

  // Upload logic
  private _upload(file: File): void {
    const endpoint = this.$endpoint();
    if (!endpoint) {
      this.$error.set("Thiếu endpoint upload");
      return;
    }

    this.$isUploading.set(true);
    this.$uploadProgress.set(0);
    this.$error.set(null);

    const formData = new FormData();
    formData.append("file", file);

    this._http
      .post<UploadApiResponse>(endpoint, formData, {
        observe: "events",
        reportProgress: true,
      })
      .subscribe({
        next: (event: HttpEvent<UploadApiResponse>): void => {
          switch (event.type) {
            case HttpEventType.Sent: {
              this.$uploadProgress.set(0);
              break;
            }
            case HttpEventType.UploadProgress: {
              if (event.total && event.total > 0) {
                const percent = Math.round((event.loaded / event.total) * 100);
                this.$uploadProgress.set(percent);
              }
              break;
            }
            case HttpEventType.Response: {
              const resp = (event as HttpResponse<UploadApiResponse>).body;
              if (!resp) {
                this.$error.set("Phản hồi upload không hợp lệ");
                this.$isUploading.set(false);
                return;
              }
              const uploadedAt = resp.uploadedAt ?? new Date().toISOString();
              const value: UploadValue = {
                url: resp.url,
                metadata: {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  uploadedAt,
                  extra: resp.metadata,
                },
              };
              this.$value.set(value);
              this.$isUploading.set(false);
              this.$uploadProgress.set(100);
              this._onChange(this.$value());
              break;
            }
          }
        },
        error: (err: HttpErrorResponse): void => {
          this.$isUploading.set(false);
          this.$error.set(this._formatUploadError(err));
        },
      });
  }

  formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  private _formatUploadError(err: HttpErrorResponse): string {
    try {
      const msg =
        err.error && typeof err.error === "object" && "message" in err.error
          ? String((err.error as { message?: unknown }).message ?? "")
          : "";
      return msg || err.message || "Tải lên thất bại";
    } catch {
      return err.message || "Tải lên thất bại";
    }
  }
}
