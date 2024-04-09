import { NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BookmarkVM } from "@shared/models";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/ui-dialog-brain";
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from "@spartan-ng/ui-dialog-helm";
import { HlmInputDirective, HlmInputErrorDirective } from "@spartan-ng/ui-input-helm";
import { HlmLabelDirective } from "@spartan-ng/ui-label-helm";

type BookmarkDetailForm = FormGroup<{
  url: FormControl<string>;
}>;

@Component({
  selector: "app-bookmark-detail-dialog",
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmDialogDescriptionDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmInputErrorDirective,
    HlmButtonDirective,
  ],
  templateUrl: "./bookmark-detail-dialog.component.html",
  styleUrl: "./bookmark-detail-dialog.component.scss",
})
export class BookmarkDetailDialogComponent implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);
  private readonly _nonNullFb = inject(NonNullableFormBuilder);
  private readonly _dialogContext = injectBrnDialogContext<{
    data: BookmarkVM | null;
  }>();

  form!: BookmarkDetailForm;

  get data() {
    return this._dialogContext.data;
  }
  get url() {
    return this.form.controls.url;
  }

  ngOnInit(): void {
    this._initForm();
    this._setValueForControls();
  }

  onClose(): void {
    this._dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      this._dialogRef.close({ ...raw });
    }
  }

  private _initForm(): void {
    this.form = this._nonNullFb.group({
      url: this._nonNullFb.control("", { validators: Validators.required }),
    });
  }

  private _setValueForControls(): void {
    const data = this._dialogContext.data;
    if (data) {
      this.form.setValue({
        url: data.url,
      });
    }
  }
}
