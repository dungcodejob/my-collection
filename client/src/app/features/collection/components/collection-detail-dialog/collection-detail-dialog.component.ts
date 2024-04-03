import { NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
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

type CollectionDetailForm = FormGroup<{
  title: FormControl<string>;
}>;

type CollectionResult = CreateCollectionDto | UpdateCollectionDto;

@Component({
  selector: "app-collection-detail",
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

  templateUrl: "./collection-detail-dialog.component.html",
  styleUrl: "./collection-detail-dialog.component.scss",
})
export class CollectionDetailDialogComponent implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef<CollectionResult>>(BrnDialogRef);
  private readonly _nonNullFb = inject(NonNullableFormBuilder);
  private readonly _dialogContext = injectBrnDialogContext<{
    data: CollectionDto | null;
  }>();

  form!: CollectionDetailForm;

  get title() {
    return this.form.controls.title;
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
      this._dialogRef.close({ ...raw, icon: "lucideFolder" });
    }
  }

  private _initForm(): void {
    this.form = this._nonNullFb.group({
      title: this._nonNullFb.control("", { validators: Validators.required }),
    });
  }

  private _setValueForControls(): void {
    const data = this._dialogContext.data;
    if (data) {
      this.form.setValue({
        title: data.title,
      });
    }
  }
}
