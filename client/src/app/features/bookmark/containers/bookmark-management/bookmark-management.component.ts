import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BookmarkDetailDialogComponent } from "@bookmark/components/bookmark-detail-dialog/bookmark-detail-dialog.component";
import { BookmarkDetailFacade } from "@bookmark/components/bookmark-detail-dialog/bookmark-detail.facade";
import { BookmarkListComponent } from "@bookmark/components/bookmark-list/bookmark-list.component";
import { PadDialogService } from "@shared/ui";
import { isNotFalsy, isNotNil } from "@shared/utils";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmH4Directive } from "@spartan-ng/ui-typography-helm";
import { filter, map } from "rxjs";
import { BookmarkFacade } from "./bookmark-management.facade";

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
    BookmarkDetailFacade,
    BookmarkFacade,
    provideIcons({
      lucideCirclePlus,
    }),
  ],
})
export class BookmarkManagementComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _vcr = inject(ViewContainerRef);
  private readonly _dialogService = inject(PadDialogService);
  private readonly _facade = inject(BookmarkFacade);
  private readonly _route = inject(ActivatedRoute);

  $collection = this._facade.$collection;
  $entities = this._facade.$entities;
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
    const data$ = this._dialogService
      .open(BookmarkDetailDialogComponent, {
        closeOnBackdropClick: false,
        contentClass: "max-w-[30rem]",
        vcr: this._vcr,
      })
      .closed$.pipe(filter(isNotNil));

    this._facade.add(data$);
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
