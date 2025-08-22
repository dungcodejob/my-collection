import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CollectionStore } from "@client/web-collection-data-access";
import { MCCollectionList } from "@client/web-collection-feature-list";
import { MCHeader } from "@client/web-shell-ui-header";
import { MCSidebar } from "@client/web-shell-ui-sidebar";
import { BrnSeparatorComponent } from "@spartan-ng/brain/separator";
import { HlmSeparatorModule } from "@spartan-ng/helm/separator";

@Component({
  selector: "mc-layout",
  imports: [
    MCSidebar,
    MCHeader,
    BrnSeparatorComponent,
    HlmSeparatorModule,
    RouterOutlet,
    MCCollectionList,
  ],
  templateUrl: "./layout.html",
  styleUrl: "./layout.css",
})
export class MCLayout {
  collectionStore = inject(CollectionStore);
}
