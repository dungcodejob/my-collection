import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewContainerRef,
  computed,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BookmarkListComponent } from "@bookmark/components/bookmark-list/bookmark-list.component";
import { BookmarkDetailDialogComponent } from "@bookmark/containers/bookmark-detail-dialog/bookmark-detail-dialog.component";
import {
  BookmarkFacade,
  TagStore,
  provideBookmarkMockApi,
  provideCrawlApi,
  provideTagMockApi,
} from "@bookmark/data-access";
import { lucideRotateCw } from "@ng-icons/lucide";
import { CreateBookmarkDto, UpdateBookmarkDto } from "@shared/models";
import { FunctionPipe } from "@shared/pipes";
import { PadDialogService } from "@shared/ui";
import {
  injectAutoEffect,
  injectParams,
  injectQueryParams,
  isNotFalsy,
} from "@shared/utils";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { HlmH4Directive } from "@spartan-ng/ui-typography-helm";
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  take,
  tap,
} from "rxjs";

// Generics
export function coerceArray<T>(value: T | T[]): T[];
export function coerceArray<T>(value: T | readonly T[]): readonly T[];
export function coerceArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

const lucideCirclePlus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`;

@Component({
  templateUrl: "./bookmark-management.component.html",
  styleUrls: ["./bookmark-management.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    HlmH4Directive,
    HlmIconComponent,
    HlmButtonDirective,
    BookmarkListComponent,
    FunctionPipe,
    ReactiveFormsModule,
    HlmInputDirective,
  ],
  providers: [
    // provideBookmarkApi(),
    provideBookmarkMockApi(),
    provideCrawlApi(),
    // provideTagApi(),
    provideTagMockApi(),
    TagStore,

    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
    }),
  ],
})
export class BookmarkManagementComponent implements OnInit {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _vcr = inject(ViewContainerRef);
  private readonly _dialogService = inject(PadDialogService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  protected readonly facade = inject(BookmarkFacade);

  readonly $collectionId = injectParams("collectionId");
  readonly $keyword = injectQueryParams("keyword");
  readonly $pageSize = injectQueryParams("pageSize", {
    initialValue: 20,
    transform: v => Number(v),
  });
  readonly $currentPage = injectQueryParams("currentPage", {
    initialValue: 1,
    transform: v => Number(v),
  });

  searchControl = new FormControl<string | null>(null);
  ngOnInit(): void {
    this.facade.enter();
    this.connect();
    this.syncToUrl();
    this.formValueEffect();
  }

  onAdd(): void {
    const result$: Observable<CreateBookmarkDto> = this._dialogService
      .open(BookmarkDetailDialogComponent, {
        closeOnBackdropClick: false,
        contentClass: "max-w-[40rem]",
        vcr: this._vcr,
        context: { collectionId: this.$collectionId() },
      })
      .closed$.pipe(
        take(1),
        filter(isNotFalsy),
        map(data => ({ ...data, collectionId: this.$collectionId() }))
      );

    this.facade.create(result$);
  }

  onEdit(id: string): void {
    const data = this.facade.$items().find(b => b.id === id);

    if (data) {
      const result$: Observable<UpdateBookmarkDto> = this._dialogService
        .open(BookmarkDetailDialogComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[40rem]",
          vcr: this._vcr,
          context: { collectionId: this.$collectionId(), data },
        })
        .closed$.pipe(
          take(1),
          filter(isNotFalsy),
          map(result => ({ ...result, id }))
        );

      this.facade.edit(result$);
    }
  }

  onDelete(id: string): void {
    const id$ = this._dialogService
      .openConfirmDialog({
        description: `This action cannot be undone. It will permanently delete your bookmark, from our servers`,
        confirmText: `Delete bookmark`,
      })
      .pipe(
        filter(isNotFalsy),
        map(() => id)
      );
    this.facade.delete(id$);
  }

  private connect() {
    const $filter = computed(() => {
      return {
        collectionId: this.$collectionId() ?? undefined,
        keyword: this.$keyword() ?? undefined,
      };
    });
    const $pagination = computed(() => {
      return {
        pageSize: this.$pageSize() as number,
        currentPage: this.$currentPage() as number,
      };
    });
    this.facade.connectFilter($filter);
    this.facade.connectPagination($pagination);
  }

  private syncToUrl() {
    this._autoEffect(() => {
      const filter = this.facade.$filter();
      const pagination = this.facade.$pagination();

      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { ...filter, ...pagination },
        queryParamsHandling: "merge",
      });
    });
  }

  private formValueEffect() {
    this.searchControl.setValue(this.$keyword());
    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(200),
        tap(keyword => {
          this.facade.setFilter({ keyword: keyword ?? undefined });
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }
}
