import { NgIf } from "@angular/common";
import {
  Component,
  DestroyRef,
  Injector,
  OnInit,
  effect,
  inject,
  untracked,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BookmarkVM, TagVM } from "@shared/models";

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
import { BookmarkDetailDialogFacade } from "./bookmark-detail-dialog.facade";

import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { BrnSelectImports } from "@spartan-ng/ui-select-brain";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";
import { BookmarkTagSelectComponent } from "../../components/bookmark-tag-select/bookmark-tag-select.component";
import { BookmarkDetailDialogStore } from "./bookmark-detail-dialog.store";
type BookmarkDetailForm = FormGroup<{
  url: FormControl<string>;
  title: FormControl<string>;
  domain: FormControl<string>;
  description: FormControl<string | null>;
  image: FormControl<string | null>;
  favicon: FormControl<string | null>;
  tags: FormControl<TagVM[]>;
  note: FormControl<string | null>;
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

    HlmIconComponent,
    BookmarkTagSelectComponent,

    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [BookmarkDetailDialogStore, BookmarkDetailDialogFacade],
  templateUrl: "./bookmark-detail-dialog.component.html",
  styleUrl: "./bookmark-detail-dialog.component.scss",
})
export class BookmarkDetailDialogComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);
  private readonly _fb = inject(FormBuilder);
  private readonly _dialogContext = injectBrnDialogContext<{
    data: BookmarkVM | null;
  }>();
  protected readonly facade = inject(BookmarkDetailDialogFacade);

  $tags = this.facade.$tags;
  $metadata = this.facade.$metadata;
  form!: BookmarkDetailForm;

  get data() {
    return this._dialogContext.data;
  }
  get url() {
    return this.form.controls.url;
  }

  get title() {
    return this.form.controls.title;
  }

  ngOnInit(): void {
    this.facade.enter();
    this._initForm();
    this._setValueForControls();

    effect(
      () => {
        const metadata = this.facade.$metadata();

        untracked(() => {
          if (metadata) {
            this.form.patchValue(metadata);
          }
        });
      },
      { injector: this._injector }
    );

    effect(
      () => {
        const tagResult = this.facade.$tagResult();

        untracked(() => {
          if (tagResult) {
            const tagControl = this.form.controls.tags;
            tagControl.setValue([...tagControl.value, tagResult]);
          }
        });
      },
      { injector: this._injector }
    );
  }

  onTagSearch(keyword: string): void {
    this.facade.searchTag(keyword);
  }

  onTagCreate(title: string): void {
    this.facade.createTag(title);
  }

  onGetMetadata(): void {
    const url = this.form.controls.url.value;
    this.facade.getMetadata(url);
  }

  onClose(): void {
    this._dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      // this._dialogRef.close({ ...raw });
      this.facade.add({
        url: raw.url,
        tagIds: raw.tags.map(item => item.id),
      });
    }
  }

  private _initForm(): void {
    this.form = this._fb.group<BookmarkDetailForm["controls"]>({
      url: this._fb.control("", { nonNullable: true, validators: Validators.required }),
      title: this._fb.control("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      domain: this._fb.control("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      description: this._fb.control(null),
      image: this._fb.control(null),
      favicon: this._fb.control(null),
      tags: this._fb.control([], { nonNullable: true, validators: Validators.required }),
      note: this._fb.control(null),
    });
  }

  private async _setValueForControls(): Promise<void> {
    const data = this._dialogContext.data;
    if (data) {
      this.form.patchValue({
        url: data.url,
        tags: [],
      });
    } else {
      const copied = await navigator.clipboard.readText();

      this.form.patchValue({ url: copied });
    }
  }
}
