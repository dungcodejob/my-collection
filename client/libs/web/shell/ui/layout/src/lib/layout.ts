import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CollectionStore } from "@client/web-collection-data-access";
import { MCCollectionList } from "@client/web-collection-feature-list";
import { AppSidebarComponent } from "@client/web-shell-ui-sidebar";
import { SiteHeaderComponent } from "@client/web-shell-ui-top-bar";
import { BrnSeparatorComponent } from "@spartan-ng/brain/separator";
import { HlmSeparatorDirective } from "@spartan-ng/helm/separator";

@Component({
  selector: "mc-layout",
  imports: [
    AppSidebarComponent,
    SiteHeaderComponent,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    RouterOutlet,
    MCCollectionList,
  ],
  templateUrl: "./layout.html",
  styleUrl: "./layout.css",
})
export class MCLayout {
  collectionStore = inject(CollectionStore);
}
