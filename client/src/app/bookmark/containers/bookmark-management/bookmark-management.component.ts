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
  provideBookmarkMockApi,
  provideCrawlApi,
  provideTagMockApi,
} from "@bookmark/data-access";
import { lucideRotateCw } from "@ng-icons/lucide";
import { CreateBookmarkDto, UpdateBookmarkDto } from "@shared/models";
import { PadDialogService } from "@shared/ui";
import { isNotFalsy } from "@shared/utils";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmH4Directive } from "@spartan-ng/ui-typography-helm";
import { Observable, filter, map, take } from "rxjs";
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
    // provideBookmarkApi(),
    provideBookmarkMockApi(),
    provideCrawlApi(),
    // provideTagApi(),
    provideTagMockApi(),
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
  protected readonly facade = inject(BookmarkManagementFacade);

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
    this.facade.enter();
  }

  onAdd(): void {
    const collectionId = this.facade.$collection()?.id as string;
    const result$: Observable<CreateBookmarkDto> = this._dialogService
      .open(BookmarkDetailDialogComponent, {
        closeOnBackdropClick: false,
        contentClass: "max-w-[40rem]",
        vcr: this._vcr,
      })
      .closed$.pipe(
        take(1),
        filter(isNotFalsy),
        map(data => ({ ...data, collectionId }))
      );

    this.facade.create(result$);
  }

  onEdit(id: string): void {
    const data = this.facade.$bookmarks().find(b => b.id === id);

    if (data) {
      const result$: Observable<UpdateBookmarkDto> = this._dialogService
        .open(BookmarkDetailDialogComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[40rem]",
          vcr: this._vcr,
          context: { data },
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
}
