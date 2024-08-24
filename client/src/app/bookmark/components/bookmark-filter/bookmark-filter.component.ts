import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
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
import { lucideRotateCw } from "@ng-icons/lucide";
import { BookmarkFilterDto } from "@shared/models";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { combineLatest, debounceTime, distinctUntilChanged, startWith, tap } from "rxjs";

type BookmarkFilterForm = FormGroup<{
  keyword: FormControl<string | null>;
  tags: FormControl<string[]>;
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
  ],
  providers: [
    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
    }),
  ],
  templateUrl: "./bookmark-filter.component.html",
  styleUrl: "./bookmark-filter.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkFilterComponent implements OnInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fb = inject(NonNullableFormBuilder);

  $keyword = input.required<string | null>({ alias: "keyword" });
  $tags = input.required<string[]>({ alias: "tags" });

  form!: BookmarkFilterForm;

  onFilterChange = output<BookmarkFilterDto>();

  ngOnInit(): void {
    this._initForm();
    this._formValueEffect();
  }

  private _initForm(): void {
    this.form = this._fb.group<BookmarkFilterForm["controls"]>({
      keyword: this._fb.control(this.$keyword()),
      tags: this._fb.control(this.$tags()),
    });
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
