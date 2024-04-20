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
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
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
import { BookmarkDetailFacade } from "./bookmark-detail.facade";

import { BrnSelectImports } from "@spartan-ng/ui-select-brain";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";
import { BookmarkTagSelectComponent } from "../bookmark-tag-select/bookmark-tag-select.component";
type BookmarkDetailForm = FormGroup<{
  url: FormControl<string>;
  tags: FormControl<TagVM[]>;
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

    BookmarkTagSelectComponent,

    BrnSelectImports,
    HlmSelectImports,
  ],
  templateUrl: "./bookmark-detail-dialog.component.html",
  styleUrl: "./bookmark-detail-dialog.component.scss",
})
export class BookmarkDetailDialogComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);
  private readonly _nonNullFb = inject(NonNullableFormBuilder);
  private readonly _dialogContext = injectBrnDialogContext<{
    data: BookmarkVM | null;
  }>();
  private readonly _facade = inject(BookmarkDetailFacade);

  $tags = this._facade.$tags;
  form!: BookmarkDetailForm;

  get data() {
    return this._dialogContext.data;
  }
  get url() {
    return this.form.controls.url;
  }

  ngOnInit(): void {
    this._facade.enter();
    this._initForm();
    this._setValueForControls();

    effect(
      () => {
        const isDialogOpened = this._facade.$isDialogOpened();

        untracked(() => {
          if (!isDialogOpened) {
            this._dialogRef.close();
          }
        });
      },
      { injector: this._injector }
    );

    effect(
      () => {
        const tagResult = this._facade.$tagResult();

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
    this._facade.searchTag(keyword);
  }

  onTagCreate(title: string): void {
    this._facade.createTag(title);
  }

  onClose(): void {
    this._dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      // this._dialogRef.close({ ...raw });
      this._facade.add({
        url: raw.url,
        tagIds: raw.tags.map(item => item.id),
      });
    }
  }

  private _initForm(): void {
    this.form = this._nonNullFb.group<BookmarkDetailForm["controls"]>({
      url: this._nonNullFb.control("", { validators: Validators.required }),
      tags: this._nonNullFb.control([]),
    });
  }

  private async _setValueForControls(): Promise<void> {
    const data = this._dialogContext.data;
    if (data) {
      this.form.setValue({
        url: data.url,
        tags: [],
      });
    } else {
      const copied = await navigator.clipboard.readText();

      this.form.patchValue({ url: copied });
    }
  }
}
