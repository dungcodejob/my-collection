import { Component, OnInit, inject } from "@angular/core";
import { CollectionStore } from "@collection/data-access";
import { provideIcons } from "@ng-icons/core";
import { lucideFolder } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { CollectionFacade } from "./collection-list.facade";

@Component({
  selector: "app-collection-list",
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent],
  templateUrl: "./collection-list.component.html",
  providers: [
    CollectionStore,
    CollectionFacade,
    provideIcons({
      lucideFolder,
    }),
  ],
})
export class CollectionComponent implements OnInit {
  private readonly _facade = inject(CollectionFacade);

  $entities = this._facade.$entities;

  ngOnInit(): void {
    this._facade.enter();
  }
}
