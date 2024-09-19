import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
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
  provideBookmark,
  provideBookmarkMockApi,
  provideCrawlApi,
} from "@bookmark/data-access";
import { lucideRotateCw } from "@ng-icons/lucide";
import {
  BookmarkFilterVM,
  CreateBookmarkVM,
  TagVM,
  UpdateBookmarkVM,
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
    provideBookmarkMockApi(),
    provideCrawlApi(),
    provideBookmark(),
    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
    }),
  ],
})
export class BookmarkManagementComponent {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _vcr = inject(ViewContainerRef);
  private readonly _dialogService = inject(PadDialogService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  private readonly _facade = inject(BookmarkFacade);

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

  readonly $filter = this._facade.filter;
  readonly $tagItems = this._facade.$tagItems;
  readonly $bookmarkItems = this._facade.entities;
  readonly $pagination = this._facade.$pagination;
  readonly $visibility = this._facade.visibility;
  readonly $title = this._facade.$collectionSelectedTitle;

  onAdd(): void {
    const collectionId = this._facade.$collectionSelectedId();
    const result$: Observable<CreateBookmarkVM> = this._dialogService
      .open(BookmarkDetailDialogComponent, {
        closeOnBackdropClick: false,
        contentClass: "max-w-[40rem]",
        vcr: this._vcr,
        context: { collectionId },
      })
      .closed$.pipe(
        take(1),
        filter(isNotFalsy),
        map(data => ({ ...data, collectionId }))
      );

    this._facade.create(result$);
  }

  onEdit(id: string): void {
    const collectionId = this._facade.$collectionSelectedId();
    const data = this._facade.entities().find(b => b.id === id);

    if (data) {
      const result$: Observable<UpdateBookmarkVM> = this._dialogService
        .open(BookmarkDetailDialogComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[40rem]",
          vcr: this._vcr,
          context: { collectionId, data },
        })
        .closed$.pipe(
          take(1),
          filter(isNotFalsy),
          map(result => ({ ...result, id }))
        );

      this._facade.update(result$);
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
    this._facade.delete(id$);
  }

  onFilterChange(filter: BookmarkFilterVM): void {
    this._facade.setFilter(filter);
  }

  onNextPage(): void {
    this._facade.nextPage();
  }

  onPreviousPage(): void {
    this._facade.prevPage();
  }

  onVisibilityToggle(key: keyof BookmarkVisibility): void {
    this._facade.visibilityToggle(key);
  }
}
