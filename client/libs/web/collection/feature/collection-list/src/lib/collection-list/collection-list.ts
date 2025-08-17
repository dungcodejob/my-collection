import { Component, inject, OnInit, untracked, ViewContainerRef } from "@angular/core";
import {
  Collection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "@client/web-collection-data-access";
import { MCCollectionDetailDialog } from "@client/web-collection-detail-dialog";
import { MCCollectionTree } from "@client/web-collection-ui-tree";
import { injectAutoEffect } from "@client/web-shared-utils";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { toast } from "ngx-sonner";
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
  private readonly _autoEffect = injectAutoEffect();

  ngOnInit(): void {
    const root = this.facade.$root();
    this.facade.load({ path: root.path, currentPage: 1, pageSize: 10 });

    toast("Event has been created", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });

    this.closeDialogEffect();
    this.displayToastEffect();
  }

  onCloseDialog(): void {
    this.facade.close();
  }

  onOpenCreateDialog(): void {
    this.facade.open();
  }

  onCreateCollection(request: CreateCollectionRequest): void {
    this.facade.create(request);
  }

  onUpdateCollection(request: UpdateCollectionRequest): void {
    this.facade.update(request);
  }

  onNodeExpand(node: Collection): void {
    this.facade.load({ path: node.path, currentPage: 1, pageSize: 10 });
  }

  private closeDialogEffect(): void {
    this._autoEffect(() => {
      const isCreateFulfilled = this.facade.$isCreateFulfilled();
      const isUpdateFulfilled = this.facade.$isUpdateFulfilled();
      if (isCreateFulfilled || isUpdateFulfilled) {
        untracked(() => this.facade.close());
      }
    });
  }

  private displayToastEffect(): void {
    this._autoEffect(() => {
      const isCreateFulfilled = this.facade.$isCreateFulfilled();
      console.log("isCreateFulfilled", isCreateFulfilled);
      if (isCreateFulfilled) {
        untracked(() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
          })
        );
      }
    });
  }
}
