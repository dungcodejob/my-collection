import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from "@angular/forms";
import { lucideRotateCw, lucideX } from "@ng-icons/lucide";
import { BookmarkFilterVM, TagVM } from "@shared/models";
import { FilterSelectComponent } from "@shared/ui";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { combineLatest, debounceTime, distinctUntilChanged, startWith, tap } from "rxjs";

type BookmarkFilterForm = FormGroup<{
  keyword: FormControl<string | null>;
  tags: FormControl<TagVM[]>;
}>;

const lucideCirclePlus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`;

@Component({
  selector: "app-bookmark-filter",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputDirective,
    HlmButtonDirective,
    HlmIconComponent,
    HlmButtonDirective,

    FilterSelectComponent,
  ],
  providers: [
    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
      lucideX,
    }),
  ],
  templateUrl: "./bookmark-filter.component.html",
  styleUrl: "./bookmark-filter.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkFilterComponent implements OnInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fb = inject(NonNullableFormBuilder);

  $tags = input<TagVM[]>([], { alias: "tags" });
  $filter = input.required<BookmarkFilterVM>({ alias: "filter" });

  form!: BookmarkFilterForm;

  $tagOptions = computed(() =>
    this.$tags().map(item => ({
      label: item.title,
      value: item,
    }))
  );

  onFilterChange = output<BookmarkFilterVM>();

  ngOnInit(): void {
    this._initForm();
    this._setFormValue();
    this._formValueEffect();
  }

  onReset() {
    this.form.reset();
  }

  private _initForm(): void {
    this.form = this._fb.group<BookmarkFilterForm["controls"]>({
      keyword: this._fb.control(null),
      tags: this._fb.control([]),
    });
  }

  private _setFormValue(): void {
    const filter = this.$filter();
    this.form.patchValue(filter);
  }

  private _formValueEffect(): void {
    const { keyword, tags } = this.form.controls;

    const keyword$ = keyword.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(200),
      startWith(keyword.getRawValue())
    );

    const tags$ = tags.valueChanges.pipe(startWith(tags.getRawValue()));

    combineLatest({
      keyword: keyword$,
      tags: tags$,
    })
      .pipe(
        tap(filter => this.onFilterChange.emit(filter)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }
}
