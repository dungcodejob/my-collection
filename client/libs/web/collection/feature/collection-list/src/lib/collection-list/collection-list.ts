import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  untracked,
  ViewContainerRef,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import {
  Collection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "@client/web-collection-data-access";
import { MCCollectionDetailDialog } from "@client/web-collection-detail-dialog";
import { MCCollectionTree } from "@client/web-collection-ui-tree";
import { MCToastService } from "@client/web-shared-services";
import { MCDialogService } from "@client/web-shared-ui-dialog";
import { injectAutoEffect } from "@client/web-shared-utils";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { tap } from "rxjs";
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
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _autoEffect = injectAutoEffect();
  private readonly _dialogService = inject(MCDialogService);
  private readonly _toastService = inject(MCToastService);
  private readonly _router = inject(Router);

  ngOnInit(): void {
    const root = this.facade.$root();
    this.facade.load({ path: root.childPath, currentPage: 1, pageSize: 10 });

    this.closeDialogEffect();
    this.displayToastEffect();
  }

  onSelectCollection(collection: Collection): void {
    this._router.navigate(["home", collection.id]);
  }

  onCloseDialog(): void {
    this.facade.close();
  }

  onOpenCreateDialog(): void {
    this.facade.openCreateDialog(this.facade.$root().id);
  }

  onOpenUpdateDialog(collectionDetails: Collection): void {
    this.facade.openUpdateDialog(collectionDetails);
  }

  onCreateCollection(request: CreateCollectionRequest): void {
    this.facade.create(request);
  }

  onUpdateCollection(request: UpdateCollectionRequest): void {
    this.facade.update(request);
  }

  onDeleteCollection(collection: Collection): void {
    const parent = this.facade.$parent();
    if (!parent) {
      throw new Error("Parent is not defined");
    }

    this._dialogService
      .openConfirmDialog({
        title: "Delete collection",
        description: `This action cannot be undone. ${
          collection.isHasChild
            ? "This will permanently delete your collection and child collection from our servers."
            : "This will permanently delete your collection from our servers."
        }`,
      })
      .closed$.pipe(
        tap(result => {
          if (result) {
            this.facade.delete({ id: collection.id, path: parent.childPath });
          }
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  onNodeExpand(node: Collection): void {
    this.facade.load({ path: node.childPath, currentPage: 1, pageSize: 10 });
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
      if (isCreateFulfilled) {
        untracked(() => this._toastService.success("Collection has been created"));
      }
    });

    this._autoEffect(() => {
      const isUpdateFulfilled = this.facade.$isUpdateFulfilled();
      if (isUpdateFulfilled) {
        untracked(() => this._toastService.success("Collection has been updated"));
      }
    });
  }
}
