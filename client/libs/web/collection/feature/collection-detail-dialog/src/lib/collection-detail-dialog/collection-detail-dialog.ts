import { Component, computed, inject, input, OnInit, output } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  Collection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "@client/web-collection-data-access";
import { injectAutoEffect } from "@client/web-shared-utils";
import { NgIconComponent } from "@ng-icons/core";
import { BrnDialogModule } from "@spartan-ng/brain/dialog";
import { HlmButtonModule } from "@spartan-ng/helm/button";
import { HlmDialogModule } from "@spartan-ng/helm/dialog";
import { HlmFormFieldModule } from "@spartan-ng/helm/form-field";
import { HlmInputModule } from "@spartan-ng/helm/input";
type CollectionDetailForm = FormGroup<{
  name: FormControl<string>;
}>;

@Component({
  selector: "mc-collection-detail-dialog",
  imports: [
    ReactiveFormsModule,
    HlmInputModule,
    HlmButtonModule,
    HlmFormFieldModule,
    BrnDialogModule,
    HlmDialogModule,
    NgIconComponent,
  ],
  templateUrl: "./collection-detail-dialog.html",
  styleUrl: "./collection-detail-dialog.css",
})
export class MCCollectionDetailDialog implements OnInit {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _nonNullFb = inject(NonNullableFormBuilder);

  readonly $isOpen = input<boolean>(false, { alias: "isOpen" });
  readonly $data = input<Collection | null>(null, { alias: "data" });
  readonly $parent = input.required<Collection>({ alias: "parent" });
  readonly $isPending = input<boolean>(false, { alias: "isLoading" });
  readonly $error = input<string>("", { alias: "error" });

  readonly update = output<UpdateCollectionRequest>();
  readonly create = output<CreateCollectionRequest>();

  readonly closed = output<void>();

  readonly $title = computed(() => {
    return this.$data() ? "Edit Collection" : "Create Collection";
  });

  form!: CollectionDetailForm;

  protected get isSaveButtonDisabled(): boolean {
    return !this.form.valid || this.form.pristine || this.$isPending();
  }
  protected get isResetButtonDisabled(): boolean {
    return this.form.pristine || this.$isPending();
  }

  ngOnInit(): void {
    this.initForm();
    this.formDisableEffect();
    this.setFormValueEffect();
  }

  onSave(): void {
    const data = this.$data();
    if (data) {
      const request: UpdateCollectionRequest = {
        ...data,
        ...this.form.getRawValue(),
        parentId: this.$parent().id,
        path: this.$parent().path,
        icon: "",
      };
      this.update.emit(request);
    } else {
      const request: CreateCollectionRequest = {
        ...this.form.getRawValue(),
        icon: "",
        path: this.$parent().path,
        parentId: this.$parent().id,
      };
      this.create.emit(request);
    }
  }

  private initForm(): void {
    const data = this.$data();
    this.form = this._nonNullFb.group({
      name: this._nonNullFb.control(data?.name || "", [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  private formDisableEffect(): void {
    this._autoEffect(() => {
      if (this.$isPending()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  private setFormValueEffect(): void {
    this._autoEffect(() => {
      const data = this.$data();
      if (data) {
        this.form.patchValue({
          name: data.name,
        });
      } else {
        this.form.reset();
      }
    });
  }
}
