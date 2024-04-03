import { Component, OnInit, inject } from "@angular/core";
import { CollectionStore } from "@collection/data-access";
import { provideIcons } from "@ng-icons/core";
import { lucideFolder, lucidePlus, lucidePlusCircle } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { BrnMenuTriggerDirective } from "@spartan-ng/ui-menu-brain";
import {
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
  HlmMenuSeparatorComponent,
  HlmSubMenuComponent,
} from "@spartan-ng/ui-menu-helm";
import { CollectionFacade } from "./collection-list.facade";

const lucideEllipsis = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;
@Component({
  selector: "app-collection-list",
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmButtonDirective,
    HlmIconComponent,
    HlmIconComponent,
    HlmSubMenuComponent,
    HlmMenuSeparatorComponent,
    BrnMenuTriggerDirective,
    HlmMenuItemDirective,
    HlmMenuItemIconDirective,
  ],
  templateUrl: "./collection-list.component.html",
  styleUrls: ["./collection-list.component.scss"],
  providers: [
    CollectionStore,
    CollectionFacade,
    provideIcons({
      lucideFolder,
      lucidePlusCircle,
      lucidePlus,
      lucideEllipsis,
    }),
  ],
})
export class CollectionComponent implements OnInit {
  private readonly _facade = inject(CollectionFacade);

  $entities = this._facade.$entities;

  ngOnInit(): void {
    this._facade.enter();
  }

  onCreate() {
    this._facade.create();
  }
}
