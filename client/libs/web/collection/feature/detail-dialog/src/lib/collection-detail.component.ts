import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import { lucideLoaderCircle } from "@ng-icons/lucide";
import { CollectionFacade } from "@nx/web-collection-data-access";
import { CollectionVM } from "@nx/web-shared-models";
import { injectAutoEffect } from "@nx/web-shared-utils";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { HlmDialogModule } from "@spartan-ng/ui-dialog-helm";
import { HlmIconModule } from "@spartan-ng/ui-icon-helm";
import { HlmInputModule } from "@spartan-ng/ui-input-helm";

type CollectionDetailForm = FormGroup<{
  title: FormControl<string>;
}>;

@Component({
  selector: "app-collection-feature-detail",
  standalone: true,
  imports: [
    CommonModule,
    HlmIconModule,
    HlmInputModule,
    HlmDialogModule,
    ReactiveFormsModule,
  ],
  providers: [provideIcons({ lucideLoaderCircle })],
  templateUrl: "./collection-detail.component.html",
  styleUrl: "./collection-detail.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDetailComponent implements OnInit {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);
  private readonly _nonNullFb = inject(NonNullableFormBuilder);
  private readonly _dialogContext = injectBrnDialogContext<{
    data: CollectionVM | null;
  }>();

  private readonly _facade = inject(CollectionFacade);

  protected $isPending = this._facade.$isDetailPending;
  protected get isSaveButtonDisabled() {
    return !this.form.valid || this.form.pristine || this._facade.$isDetailPending();
  }

  protected get isResetButtonDisabled() {
    return this.form.pristine || this._facade.$isDetailPending();
  }

  protected get data() {
    return this._dialogContext.data;
  }
  protected get title() {
    return this.form.controls.title;
  }

  form!: CollectionDetailForm;

  ngOnInit(): void {
    this._initForm();
    this._setValueForControls();
    this._registerCloseDialogEffect();
    this._registerFormDisableEffect();
  }

  onSave(): void {
    if (this._dialogContext.data) {
      const data = { ...this._dialogContext.data, ...this.form.getRawValue(), icon: "" };
      this._facade.update(data);
    } else {
      const data = { ...this.form.getRawValue(), icon: "" };
      this._facade.create(data);
    }
  }

  onClose(): void {
    this._dialogRef.close();
  }

  private _initForm(): void {
    this.form = this._nonNullFb.group({
      title: this._nonNullFb.control("", [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  private _setValueForControls(): void {
    const data = this._dialogContext.data;
    if (data) {
      this.form = this._nonNullFb.group({
        title: this._nonNullFb.control("", [
          Validators.required,
          Validators.minLength(3),
        ]),
      });
    }
  }

  private _registerCloseDialogEffect(): void {
    this._autoEffect(() => {
      if (this._facade.$isDetailFulfilled()) {
        this.onClose();
      }
    });
  }

  private _registerFormDisableEffect(): void {
    this._autoEffect(() => {
      if (this._facade.$isDetailPending()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }
}
