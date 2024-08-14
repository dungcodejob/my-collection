import { CdkDrag, CdkDragDrop, CdkDropList } from "@angular/cdk/drag-drop";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CollectionFacade } from "@collection/data-access";
import { provideIcons } from "@ng-icons/core";
import {
  lucideFilePenLine,
  lucideFolder,
  lucidePlus,
  lucidePlusCircle,
  lucideTrash2,
} from "@ng-icons/lucide";
import { CollectionDto } from "@shared/models";
import { RedirectService } from "@shared/services";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { BrnMenuTriggerDirective } from "@spartan-ng/ui-menu-brain";
import {
  HlmMenuComponent,
  HlmMenuGroupComponent,
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
  HlmMenuLabelComponent,
  HlmMenuSeparatorComponent,
  HlmMenuShortcutComponent,
  HlmSubMenuComponent,
} from "@spartan-ng/ui-menu-helm";
import { HlmLargeDirective, HlmSmallDirective } from "@spartan-ng/ui-typography-helm";

const lucideEllipsis = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;
@Component({
  selector: "app-collection-list",
  standalone: true,
  imports: [
    HlmSmallDirective,
    HlmLargeDirective,

    HlmButtonDirective,
    HlmIconComponent,
    HlmSubMenuComponent,
    HlmMenuSeparatorComponent,
    BrnMenuTriggerDirective,
    HlmMenuItemDirective,
    HlmMenuItemIconDirective,
    HlmMenuShortcutComponent,
    HlmMenuLabelComponent,
    HlmMenuComponent,
    HlmMenuGroupComponent,

    CdkDropList,
    CdkDrag,
    RouterLink,
  ],
  templateUrl: "./collection-list.component.html",
  styleUrls: ["./collection-list.component.scss"],
  providers: [
    provideIcons({
      lucideFolder,
      lucidePlusCircle,
      lucidePlus,
      lucideEllipsis,
      lucideTrash2,
      lucideFilePenLine,
    }),
  ],
})
export class CollectionListComponent implements OnInit {
  private readonly _redirectService = inject(RedirectService);
  private readonly _facade = inject(CollectionFacade);

  $entities = this._facade.$collections;
  $selectedId = this._facade.$selectedCollectionId;
  ngOnInit(): void {
    this._facade.enter();
  }

  onCreate(): void {
    this._facade.create();
  }

  onEdit(id: string): void {
    this._facade.edit(id);
  }

  onDelete(id: string): void {
    this._facade.delete(id);
  }

  onRedirectToBookmark(collectionId: string): void {
    this._redirectService.redirectToBookmark(collectionId);
  }

  onDrop(event: CdkDragDrop<CollectionDto[]>) {
    this._facade.move(event.previousIndex, event.currentIndex);
  }
}
