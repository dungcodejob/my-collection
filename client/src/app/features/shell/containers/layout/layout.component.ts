import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { CollectionListComponent } from "@collection/containers/collection-list/collection-list.component";
import {
  CollectionFacade,
  CollectionStore,
  provideCollectionMockApi,
} from "@collection/data-access";
import { SidebarComponent } from "@shell/components/sidebar/sidebar.component";
import { HlmToasterComponent } from "@spartan-ng/ui-sonner-helm";
import { HlmSpinnerComponent } from "@spartan-ng/ui-spinner-helm";
import { Observable, defer, filter, map, merge, of, switchMap } from "rxjs";
import { ShellFacade, ShellStore } from "../../data-access";
type ViewModel = {
  hasHeader: boolean;
  hasSideBar: boolean;
};

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,

    SidebarComponent,
    HlmToasterComponent,
    HlmSpinnerComponent,
    CollectionListComponent,
  ],
  providers: [
    ShellStore,
    ShellFacade,
    // provideCollectionApi(),
    provideCollectionMockApi(),
    CollectionStore,
    CollectionFacade,
  ],
  templateUrl: "./layout.component.html",
  styleUrl: "./layout.component.scss",
})
export class LayoutComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _facade = inject(ShellFacade);

  $loading = this._facade.$loading;

  public vm$: Observable<ViewModel> = merge(
    this._router.events,
    this._activatedRoute.url
  ).pipe(
    switchMap(() =>
      defer(() =>
        this._activatedRoute.firstChild
          ? this._activatedRoute.firstChild?.data.pipe(
              filter(Boolean),
              map(data => ({
                hasHeader: data["hasHeader"] !== false,
                hasSideBar: data["hasSideBar"] !== false,
              }))
            )
          : of({ hasHeader: true, hasSideBar: true })
      )
    )
  );
}
