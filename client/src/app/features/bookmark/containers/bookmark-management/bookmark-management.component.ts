import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { BookmarkListComponent } from "@bookmark/components/bookmark-list/bookmark-list.component";
import { BookmarkDetailDialogComponent } from "@bookmark/containers/bookmark-detail-dialog/bookmark-detail-dialog.component";
import {
  TagStore,
  provideBookmarkApi,
  provideCrawlApi,
  provideTagApi,
} from "@bookmark/data-access";
import { lucideRotateCw } from "@ng-icons/lucide";
import { PadDialogService } from "@shared/ui";
import { isNotFalsy } from "@shared/utils";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmH4Directive } from "@spartan-ng/ui-typography-helm";
import { filter, map, take, tap } from "rxjs";
import { BookmarkManagementFacade } from "./bookmark-management.facade";
import { BookmarkManagementStore } from "./bookmark-management.store";

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
  ],
  providers: [
    provideBookmarkApi(),
    // provideBookmarkMockApi(),
    provideCrawlApi(),
    provideTagApi(),
    // provideTagMockApi(),
    TagStore,
    BookmarkManagementFacade,
    BookmarkManagementStore,

    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
    }),
  ],
})
export class BookmarkManagementComponent implements OnInit {
  private readonly _vcr = inject(ViewContainerRef);
  private readonly _dialogService = inject(PadDialogService);
  private readonly _facade = inject(BookmarkManagementFacade);

  $collection = this._facade.$collection;
  $loading = this._facade.$fetchLoading;
  $bookmarks = this._facade.$bookmarks;
  $pagination = this._facade.$pagination;

  // items = input.required({
  //   transform: coerceArray<BookmarkDto>,
  // });
  // loading = input(false);
  // @Input() error: string | null = null;
  // @Input() isNext = false;
  // @Input() isPrev = false;
  // @Output() next = new EventEmitter<void>();
  // @Output() edit = new EventEmitter<string>();
  // @Output() prev = new EventEmitter<void>();

  ngOnInit(): void {
    this._facade.enter();
  }

  onAdd(): void {
    this._facade.setDialogOpened(true);
    this._dialogService
      .open(BookmarkDetailDialogComponent, {
        closeOnBackdropClick: false,
        contentClass: "max-w-[30rem]",
        vcr: this._vcr,
      })
      .closed$.pipe(
        take(1),
        tap(() => this._facade.setDialogOpened(false))
      );
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
}
