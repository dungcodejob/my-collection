import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BookmarkFilterComponent } from "@bookmark/components/bookmark-filter/bookmark-filter.component";
import { BookmarkListComponent } from "@bookmark/components/bookmark-list/bookmark-list.component";
import { BookmarkViewComponent } from "@bookmark/components/bookmark-view/bookmark-view.component";
import { BookmarkDetailDialogComponent } from "@bookmark/containers/bookmark-detail-dialog/bookmark-detail-dialog.component";
import {
  BookmarkFacade,
  BookmarkVisibility,
  provideBookmarkMockApi,
  provideCrawlApi,
} from "@bookmark/data-access";
import { lucideRotateCw } from "@ng-icons/lucide";
import {
  BookmarkFilterVM,
  CreateBookmarkDto,
  TagVM,
  UpdateBookmarkDto,
} from "@shared/models";
import { FunctionPipe } from "@shared/pipes";
import { PadDialogService, PaginationComponent } from "@shared/ui";
import { injectAutoEffect, injectQueryParams, isNotFalsy } from "@shared/utils";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { HlmH4Directive } from "@spartan-ng/ui-typography-helm";
import { Observable, filter, map, take } from "rxjs";

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
    HlmButtonDirective,
    BookmarkFilterComponent,
    PaginationComponent,
    BookmarkFilterComponent,
    BookmarkViewComponent,
  ],
  providers: [
    // provideBookmarkApi(),
    provideBookmarkMockApi(),
    provideCrawlApi(),
    // provideTagApi(),

    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
    }),
  ],
})
export class BookmarkManagementComponent implements OnInit {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _vcr = inject(ViewContainerRef);
  private readonly _dialogService = inject(PadDialogService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  protected readonly facade = inject(BookmarkFacade);

  readonly $collectionId = this.facade.$collectionId;
  readonly $keyword = injectQueryParams("keyword");
  readonly $tags = injectQueryParams<TagVM[]>(params => {
    const tags = params["tags"];
    if (tags) {
      return JSON.parse(tags);
    }

    return [];
  });

  readonly $pageSize = injectQueryParams("pageSize", {
    initialValue: 20,
    transform: v => Number(v),
  });
  readonly $currentPage = injectQueryParams("currentPage", {
    initialValue: 1,
    transform: v => Number(v),
  });

  readonly $filter = this.facade.$filter;
  readonly $tagItems = this.facade.$tagItems;
  readonly $bookmarkItems = this.facade.$bookmarkItems;
  readonly $pagination = this.facade.$pagination;
  readonly $visibility = this.facade.$visibility;

  ngOnInit(): void {
    this.initializer();
    this.syncToUrl();
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
    const data = this.facade.$bookmarkItems().find(b => b.id === id);

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

  onFilterChange(filter: BookmarkFilterVM): void {
    this.facade.setFilter(filter);
  }

  onNextPage(): void {
    this.facade.nextPage();
  }

  onPreviousPage(): void {
    this.facade.previousPage();
  }

  onVisibilityToggle(key: keyof BookmarkVisibility): void {
    this.facade.visibilityToggle(key);
  }

  private initializer() {
    this.facade.enter({ keyword: this.$keyword(), tags: this.$tags() });
  }

  private syncToUrl() {
    this._autoEffect(() => {
      const filter = this.facade.$filter();
      const pagination = this.facade.$pagination();
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { ...filter, tags: JSON.stringify(filter.tags), ...pagination },
        queryParamsHandling: "merge",
      });
    });
  }
}
