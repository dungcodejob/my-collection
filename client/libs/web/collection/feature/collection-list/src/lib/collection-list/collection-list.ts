import { Component, inject, OnInit, ViewContainerRef } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import { MCCollectionDetailDialog } from "@client/web-collection-detail-dialog";
import { MCCollectionTree } from "@client/web-collection-ui-tree";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { MCCollectionListFacade } from "./collection-list.facade";
@Component({
  selector: "mc-collection-list",
  imports: [
    MCCollectionDetailDialog,
    MCCollectionTree,
    HlmButtonDirective,
    NgIconComponent,
  ],
  providers: [MCCollectionListFacade, provideIcons({ lucidePlus })],
  templateUrl: "./collection-list.html",
  styleUrl: "./collection-list.css",
})
export class MCCollectionList implements OnInit {
  protected readonly facade = inject(MCCollectionListFacade);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _dialogService = inject(HlmDialogService);

  ngOnInit(): void {
    const root = this.facade.$root();
    this.facade.load({ filter: { path: root.path, currentPage: 1, pageSize: 10 } });
  }

  onCloseDialog(): void {
    this.facade.close();
  }

  onOpenCreateDialog(): void {
    this.facade.open();
  }

  onNodeExpand(node: Collection): void {
    this.facade.load({ filter: { path: node.path, currentPage: 1, pageSize: 10 } });
  }
}
