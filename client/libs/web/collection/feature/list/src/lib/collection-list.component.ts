import { PadDialogService } from "@nx/web-shared-confirm-dialog";
import { HlmDialogService } from "@spartan-ng/ui-dialog-helm";
import { CollectionFacade } from "@nx/web-collection-data-access";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { provideIcons } from "@ng-icons/core";
import {
  lucideCirclePlus,
  lucideEllipsis,
  lucideFilePenLine,
  lucideFolder,
  lucidePlus,
  lucideTrash2,
} from "@ng-icons/lucide";
import { HlmIconModule } from "@spartan-ng/ui-icon-helm";
import { HlmMenuModule } from "@spartan-ng/ui-menu-helm";
import { RedirectService } from "@nx/web-shared-services";
import { CollectionDetailComponent } from "@nx/web-collection-feature-detail-dialog";
import { filter, tap } from "rxjs";
import { isNotNil } from "@nx/web-shared-utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CollectionVM, CreateCollectionDto, Identity } from "@nx/web-shared-models";
import { CollectionMessages } from "@nx/web-shared-messages";
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from "@angular/cdk/drag-drop";
import { HlmButtonModule } from "@spartan-ng/ui-button-helm";
import { BrnMenuModule } from "@spartan-ng/brain/menu";

@Component({
  selector: "app-collection-feature-list",
  standalone: true,
  imports: [
    CommonModule,
    HlmIconModule,
    HlmButtonModule,
    DragDropModule,
    HlmMenuModule,
    BrnMenuModule,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideFolder,
      lucideCirclePlus,
      lucideEllipsis,
      lucideTrash2,
      lucideFilePenLine,
    }),
  ],
  templateUrl: "./collection-list.component.html",
  styleUrl: "./collection-list.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionListComponent {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _facade = inject(CollectionFacade);
  private readonly _redirectService = inject(RedirectService);
  private readonly _dialogService = inject(PadDialogService);

  $items = this._facade.$items;
  $selectedId = this._facade.$selectedId;

  onCreate(): void {
    this._dialogService
      .open(CollectionDetailComponent, {
        closeOnBackdropClick: false,
        contentClass: "max-w-[30rem]",
      })
      .closed$.pipe(filter(isNotNil), takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }

  onEdit(id: Identity): void {
    const data = this.$items().find(item => item.id === id);

    if (data) {
      this._dialogService
        .open(CollectionDetailComponent, {
          closeOnBackdropClick: false,
          contentClass: "max-w-[30rem]",
        })
        .closed$.pipe(filter(isNotNil), takeUntilDestroyed(this._destroyRef))
        .subscribe();
    }
  }

  onDelete(id: Identity): void {
    this._dialogService
      .openConfirmDialog({
        description: CollectionMessages.DeleteConfirm,
        confirmText: `Delete collection`,
      })
      .pipe(
        tap(() => this._facade.delete(id)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  onDrop(event: CdkDragDrop<CollectionVM[]>) {
    this._facade.move({
      fromIndex: event.previousIndex,
      toIndex: event.currentIndex,
    });
  }

  onRedirectToBookmark(id: Identity) {}
}
